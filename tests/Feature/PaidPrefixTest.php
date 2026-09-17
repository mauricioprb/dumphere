<?php

declare(strict_types=1);

use App\Actions\PurgeStaleDocuments;
use App\Models\Document;
use App\Support\PrefixCookie;
use App\Support\RecoveryKey;
use App\Support\WebSocketTokenService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

function paidChild(string $slug = 'acme/notes'): Document
{
    return Document::create(['slug' => $slug, 'title' => 'Notes', 'content_html' => '']);
}

function paidPrefix(array $attributes = []): Document
{
    $document = Document::create(['slug' => 'acme', 'title' => 'Acme', 'content_html' => '']);

    // Ownership is not mass assignable, exactly as in the application.
    $document->forceFill([
        'paid_until' => now()->addYear(),
        'owner_recovery_key_hash' => RecoveryKey::digest('recovery-key-123'),
        'owner_password_hash' => Hash::make('correct horse battery'),
        ...$attributes,
    ])->save();

    return $document;
}

it('never hands out a websocket token for a read-only prefix', function (): void {
    $this->withoutVite();
    paidPrefix(['readonly' => true]);
    paidChild();

    $this->get('/acme/notes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Document/Show')
            ->where('readonly', true)
            ->where('paid', true)
            ->has('wsToken'));

    // The token exists, but only to watch: the collaboration server drops its writes.
    $token = app(WebSocketTokenService::class);
    $page = $this->get('/acme/notes')->viewData('page');
    $decoded = base64_decode(strtr($page['props']['wsToken'], '-_', '+/'), true);

    expect(explode(':', $decoded)[1])->toBe(WebSocketTokenService::SCOPE_READ)
        ->and($token->verify($page['props']['wsToken']))->not->toBeNull();
});

it('refuses saves on a read-only prefix', function (): void {
    paidPrefix(['readonly' => true]);
    paidChild();

    $this->post('/acme/notes/save', ['contentHtml' => '<p>nope</p>'])->assertForbidden();
});

it('asks for the password again on every visit', function (): void {
    $this->withoutVite();
    paidPrefix(['visitor_password_hash' => Hash::make('team-secret')]);
    paidChild();

    $this->get('/acme/notes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Document/Locked'));

    $this->post('/acme/notes', ['password' => 'wrong'])->assertSessionHasErrors('password');

    $response = $this->post('/acme/notes', ['password' => 'team-secret'])
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Document/Show'));

    // No access grant is handed to the browser, so the next visit is locked again.
    $granted = collect($response->headers->getCookies())
        ->map(fn ($cookie) => $cookie->getName())
        ->filter(fn (string $name) => str_starts_with($name, 'dh_'));

    expect($granted)->toBeEmpty();

    $this->get('/acme/notes')->assertInertia(fn (Assert $page) => $page->component('Document/Locked'));
});

it('accepts a save only with a token minted under the current rules', function (): void {
    $this->withoutVite();
    $document = paidPrefix(['visitor_password_hash' => Hash::make('team-secret')]);
    paidChild();

    $token = $this->post('/acme/notes', ['password' => 'team-secret'])
        ->assertOk()
        ->viewData('page')['props']['wsToken'];

    $this->postJson('/acme/notes/save', ['contentHtml' => '<p>hi</p>', 'wsToken' => $token])->assertOk();
    $this->postJson('/acme/notes/save', ['contentHtml' => '<p>hi</p>'])->assertForbidden();

    // The owner closes the page differently; the token stops proving anything.
    $document->forceFill(['visitor_password_hash' => Hash::make('another')])->save();

    $this->postJson('/acme/notes/save', ['contentHtml' => '<p>hi</p>', 'wsToken' => $token])->assertForbidden();
});

it('never creates a missing paid child while validating a visitor token', function (): void {
    paidPrefix(['visitor_password_hash' => Hash::make('team-secret')]);

    $this->postJson('/acme/uninvited/save', [
        'contentHtml' => '<p>intrusion</p>',
        'wsToken' => 'invalid',
    ])->assertForbidden();

    expect(Document::where('slug', 'acme/uninvited')->exists())->toBeFalse();
});

it('protects a locked prefix tree with the current page token', function (): void {
    $this->withoutVite();
    $owner = paidPrefix(['visitor_password_hash' => Hash::make('team-secret')]);
    paidChild('acme/notes');
    paidChild('acme/private-plan')->update(['title' => 'Private plan']);

    $this->getJson('/api/document-tree/acme')->assertForbidden();

    $token = $this->post('/acme/notes', ['password' => 'team-secret'])
        ->assertOk()
        ->viewData('page')['props']['wsToken'];

    $this->withToken($token)
        ->getJson('/api/document-tree/acme')
        ->assertOk()
        ->assertJsonFragment(['slug' => 'acme/private-plan', 'label' => 'Private plan']);

    $owner->forceFill(['visitor_password_hash' => Hash::make('new-secret')])->save();

    $this->withToken($token)->getJson('/api/document-tree/acme')->assertForbidden();
});

it('keeps paid prefixes and their children out of the purge', function (): void {
    $paid = paidPrefix();
    $child = Document::create(['slug' => 'acme/notes', 'title' => 'Notes', 'content_html' => '']);
    $free = Document::create(['slug' => 'free', 'title' => 'Free', 'content_html' => '']);

    foreach ([$paid, $child, $free] as $document) {
        $document->timestamps = false;
        $document->forceFill(['last_accessed_at' => now()->subDays(60), 'created_at' => now()->subDays(60)])->save();
    }

    expect(app(PurgeStaleDocuments::class)->execute())->toBe(1)
        ->and(Document::whereIn('slug', ['acme', 'acme/notes'])->count())->toBe(2)
        ->and(Document::where('slug', 'free')->exists())->toBeFalse();
});

it('lets a manually granted owner open the in-page settings', function (): void {
    $this->artisan('prefix:grant', [
        'address' => 'acme',
        '--password' => 'a decent password',
    ])->assertSuccessful();

    $this->postJson('/acme/notes/settings', ['password' => 'wrong'])->assertStatus(422);

    $this->postJson('/acme/notes/settings', [
        'password' => 'a decent password',
        'apply' => true,
        'readonly' => true,
        'visitor_password' => 'team-secret',
        'clear_visitor_password' => false,
    ])->assertOk()->assertJson(['prefix' => 'acme', 'readonly' => true, 'hasVisitorPassword' => true]);

    expect(Document::where('slug', 'acme')->first()->visitor_password_hash)->not->toBeNull();
});

it('lets the owner edit and skip the password while the cookie lasts', function (): void {
    $this->withoutVite();
    paidPrefix(['readonly' => true, 'visitor_password_hash' => Hash::make('team-secret')]);

    // A stranger sees the lock.
    $this->get('/acme/notes')->assertInertia(fn (Assert $page) => $page->component('Document/Locked'));

    $response = $this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk();

    $cookies = collect($response->headers->getCookies())
        ->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])
        ->all();

    $owner = $this->withUnencryptedCookies($cookies);

    // The owner walks past the visitor password and past read-only.
    $owner->get('/acme/notes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Document/Show')
            ->where('isOwner', true)
            ->where('readonly', false)
            ->where('readonlyForVisitors', true)
            ->where('lockedForVisitors', true)
            ->has('wsToken'));

    $owner->post('/acme/notes/save', ['contentHtml' => '<p>mine</p>'])->assertOk();

    // And the settings open with no password at all.
    $owner->withCredentials()->postJson('/acme/settings', [])->assertOk()->assertJson(['readonly' => true]);
});

it('switches the mode without requiring every optional field', function (): void {
    paidPrefix(['readonly' => false]);

    $this->postJson('/acme/settings', [
        'password' => 'correct horse battery',
        'apply' => true,
        'readonly' => true,
        'clear_visitor_password' => true,
    ])->assertOk()->assertJson(['readonly' => true]);

    expect(Document::where('slug', 'acme')->first()->readonly)->toBeTrue();
});

it('answers in the language the browser asked for', function (): void {
    paidPrefix(['visitor_password_hash' => Hash::make('123')]);

    $this->withHeader('Accept-Language', 'pt-BR,pt;q=0.9')
        ->post('/acme/notes/unlock', ['password' => 'wrong'])
        ->assertSessionHasErrors(['password' => 'Senha incorreta.']);

    $this->flushSession();

    $this->withHeader('Accept-Language', 'en-US,en;q=0.9')
        ->post('/acme/notes/unlock', ['password' => 'wrong'])
        ->assertSessionHasErrors(['password' => 'Wrong password.']);
});

it('keeps the owner privilege on one browser at a time', function (): void {
    paidPrefix();

    $cookiesOf = fn ($response) => collect($response->headers->getCookies())
        ->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])
        ->all();

    $first = $cookiesOf($this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk());

    // Signing in somewhere else retires the session the first browser was holding.
    $second = $cookiesOf($this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk());

    expect($first)->not->toBe($second);

    $this->withUnencryptedCookies($second)->withCredentials()->postJson('/acme/settings', [])->assertOk();
    $this->withUnencryptedCookies($first)->withCredentials()->postJson('/acme/settings', [])->assertStatus(422);
});

it('drops the previous browser out of owner mode on the page itself', function (): void {
    $this->withoutVite();
    paidPrefix(['readonly' => true]);

    $cookiesOf = fn ($response) => collect($response->headers->getCookies())
        ->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])
        ->all();

    $first = $cookiesOf($this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk());

    $this->withUnencryptedCookies($first)->get('/acme')
        ->assertInertia(fn (Assert $page) => $page->where('isOwner', true)->where('readonly', false));

    $second = $cookiesOf($this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk());

    expect($first)->not->toBe($second);

    $this->withUnencryptedCookies($first)->get('/acme')
        ->assertInertia(fn (Assert $page) => $page->where('isOwner', false)->where('readonly', true));

    $this->withUnencryptedCookies($second)->get('/acme')
        ->assertInertia(fn (Assert $page) => $page->where('isOwner', true)->where('readonly', false));
});

it('retires the collaboration token when ownership moves to another browser', function (): void {
    $this->withoutVite();
    $document = paidPrefix(['readonly' => true]);

    $cookies = collect(
        $this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk()->headers->getCookies()
    )->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])->all();

    $token = $this->withUnencryptedCookies($cookies)->get('/acme')->viewData('page')['props']['wsToken'];
    $current = fn () => WebSocketTokenService::gate(
        (bool) $document->fresh()->readonly,
        $document->fresh()->visitor_password_hash,
        $document->fresh()->owner_session_id,
    );

    expect(explode(':', base64_decode(strtr($token, '-_', '+/'), true))[2])->toBe($current());

    // Someone signs in as owner elsewhere: the first browser's token stops describing reality.
    PrefixCookie::claim($document->fresh());

    expect(explode(':', base64_decode(strtr($token, '-_', '+/'), true))[2])->not->toBe($current());
});

it('lets the owner delete subpages but never the address itself', function (): void {
    paidPrefix();
    paidChild();
    paidChild('acme/notes/deep');

    $cookies = collect(
        $this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk()->headers->getCookies()
    )->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])->all();

    $this->deleteJson('/acme/notes')->assertForbidden();

    $owner = $this->withUnencryptedCookies($cookies)->withCredentials();

    $owner->deleteJson('/acme')->assertStatus(422);
    $notified = null;

    DB::listen(function ($query) use (&$notified): void {
        if (str_contains($query->sql, 'pg_notify')) {
            $notified = $query->bindings;
        }
    });

    $owner->deleteJson('/acme/notes')->assertOk()->assertJson(['removed' => 2]);

    expect(Document::where('slug', 'like', 'acme/%')->count())->toBe(0)
        ->and(Document::where('slug', 'acme')->exists())->toBeTrue();
});

it('keeps strangers from conjuring pages inside a paid address', function (): void {
    $this->withoutVite();
    paidPrefix();

    $this->get('/acme/uninvited')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
            ->where('reason', 'taken')
            ->where('prefix', 'acme'));

    expect(Document::where('slug', 'acme/uninvited')->exists())->toBeFalse();

    $this->postJson('/acme/uninvited/save', ['contentHtml' => '<p>Created by POST</p>'])
        ->assertNotFound();

    expect(Document::where('slug', 'acme/uninvited')->exists())->toBeFalse();

    $cookies = collect(
        $this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk()->headers->getCookies()
    )->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])->all();

    $this->withUnencryptedCookies($cookies)->get('/acme/invited')->assertOk();

    expect(Document::where('slug', 'acme/invited')->exists())->toBeTrue();

    // Free addresses keep working the way they always did.
    $this->get('/somewhere-else')->assertOk();

    // And an address that never existed gets the same page, with the other reason.
    $this->get('/nao/existe/isso!')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('Error')->where('status', 404)->where('reason', null));

    // Rate limiting gets the same treatment, with the wait it asks for.
    foreach (range(1, 6) as $ignored) {
        $response = $this->post('/recover', []);
    }

    $response->assertStatus(429)
        ->assertInertia(fn (Assert $page) => $page->component('Error')->where('status', 429)->has('retryAfter'));
});

it('does not throttle the owner creating pages inside the address they paid for', function (): void {
    $this->withoutVite();
    paidPrefix();

    $cookies = collect(
        $this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk()->headers->getCookies()
    )->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])->all();

    $owner = $this->withUnencryptedCookies($cookies);

    // Well past the per-IP limit that keeps strangers from spamming new documents.
    foreach (range(1, 14) as $index) {
        $owner->get("/acme/page-{$index}")->assertOk();
    }

    expect(Document::where('slug', 'like', 'acme/page-%')->count())->toBe(14);

    // The owner's pages never touched the counter, so free addresses still have it whole.
    foreach (range(1, 10) as $index) {
        $this->get("/free-{$index}")->assertOk();
    }

    $this->get('/free-11')->assertTooManyRequests();
});

it('caps an owned address at the configured number of documents', function (): void {
    $this->withoutVite();
    config(['prefix.max_documents' => 3]);

    paidPrefix();
    paidChild('acme/one');
    paidChild('acme/two');

    $cookies = collect(
        $this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk()->headers->getCookies()
    )->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])->all();

    $owner = $this->withUnencryptedCookies($cookies)->withCredentials();

    $owner->get('/acme/three')
        ->assertConflict()
        ->assertInertia(fn (Assert $page) => $page->component('Error')->where('status', 409));

    expect(Document::where('slug', 'acme/three')->exists())->toBeFalse();

    $owner->deleteJson('/acme/two')->assertOk();
    $owner->get('/acme/three')->assertOk();

    expect(Document::query()
        ->where('slug', 'acme')
        ->orWhere('slug', 'like', 'acme/%')
        ->count())->toBe(3);
});

it('pins the palette of a paid address for everyone who opens it', function (): void {
    $this->withoutVite();
    paidPrefix();
    paidChild();

    $cookies = collect(
        $this->postJson('/acme/settings', ['password' => 'correct horse battery'])->assertOk()->headers->getCookies()
    )->mapWithKeys(fn ($cookie) => [$cookie->getName() => $cookie->getValue()])->all();

    $this->withUnencryptedCookies($cookies)->withCredentials()->postJson('/acme/settings', [
        'password' => 'correct horse battery',
        'apply' => true,
        'readonly' => false,
        'clear_visitor_password' => true,
        'theme_hue' => 210,
        'theme_chroma' => 35,
        'theme_hue_dark' => 40,
        'theme_chroma_dark' => 0,
    ])->assertOk()->assertJson([
        'themeHue' => 210,
        'themeChroma' => 35,
        'themeHueDark' => 40,
        'themeChromaDark' => 0,
    ]);

    // A stranger on another machine gets the same palette, written before the first paint.
    $html = $this->get('/acme/notes')->assertOk()->getContent();

    expect($html)->toContain("root.dataset.themeHue = '210'")
        ->and($html)->toContain("--light-hue', '210deg")
        ->and($html)->toContain("--light-chroma', '0.35")
        ->and($html)->toContain("--dark-hue', '40deg")
        ->and($html)->toContain("--dark-chroma', '0");

    // Clearing it hands the address back to the daily palette.
    $this->withUnencryptedCookies($cookies)->withCredentials()->postJson('/acme/settings', [
        'password' => 'correct horse battery',
        'apply' => true,
        'readonly' => false,
        'clear_visitor_password' => true,
        'theme_hue' => null,
        'theme_chroma' => null,
        'theme_hue_dark' => null,
        'theme_chroma_dark' => null,
    ])->assertOk()->assertJson(['themeHue' => null, 'themeChroma' => null, 'themeHueDark' => null]);

    expect($this->get('/acme/notes')->getContent())->not->toContain("root.dataset.themeHue = '");
});

it('rejects retired payment endpoints without changing ownership', function (string $method, string $path): void {
    $this->withoutVite();
    $document = paidPrefix();
    $attributes = $document->fresh()->getAttributes();

    $this->call($method, $path, [
        'prefix' => 'acme',
        'session_id' => 'cs_test_123',
        'password' => 'stolen password',
        'password_confirmation' => 'stolen password',
    ])->assertNotFound();

    expect($document->fresh()->getAttributes())->toBe($attributes)
        ->and(Document::count())->toBe(1);
})->with([
    'checkout' => ['POST', '/checkout'],
    'webhook' => ['POST', '/checkout/webhook'],
    'claim page' => ['GET', '/claim?session_id=cs_test_123'],
    'claim password' => ['POST', '/claim'],
]);

it('preserves a legacy receipt as a recovery key during migration', function (): void {
    $migration = require database_path(
        'migrations/2026_08_21_180658_replace_receipt_recovery_with_key_on_documents_table.php',
    );

    $migration->down();

    $documentId = (string) Str::uuid();
    $receiptUrl = 'https://pay.stripe.com/receipts/legacy-buyer';

    DB::table('documents')->insert([
        'id' => $documentId,
        'slug' => 'legacy-buyer',
        'title' => 'Legacy buyer',
        'content_html' => '',
        'stripe_receipt_url' => $receiptUrl,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $migration->up();

    expect(Schema::hasColumn('documents', 'stripe_receipt_url'))->toBeFalse()
        ->and(DB::table('documents')->where('id', $documentId)->value('owner_recovery_key_hash'))
        ->toBe(RecoveryKey::digest($receiptUrl));
});

it('accepts whatever password the owner picks', function (): void {
    paidPrefix();

    $this->postJson('/acme/settings', [
        'password' => 'correct horse battery',
        'apply' => true,
        'readonly' => false,
        'visitor_password' => '123',
        'clear_visitor_password' => false,
    ])->assertOk()->assertJson(['hasVisitorPassword' => true]);

    expect(Hash::check('123', Document::where('slug', 'acme')->first()->visitor_password_hash))->toBeTrue();
});

it('refuses to require a password without one being set', function (): void {
    paidPrefix();

    $this->postJson('/acme/settings', [
        'password' => 'correct horse battery',
        'apply' => true,
        'readonly' => false,
        'visitor_password' => null,
        'clear_visitor_password' => false,
    ])->assertStatus(422)->assertJsonValidationErrors('visitor_password');
});

it('stops honouring tokens minted before the rules changed', function (): void {
    $this->withoutVite();
    $document = paidPrefix();
    paidChild();
    $token = app(WebSocketTokenService::class);

    $before = $this->get('/acme/notes')->viewData('page')['props']['wsToken'];
    $openGate = WebSocketTokenService::gate(false, null);

    expect(explode(':', base64_decode(strtr($before, '-_', '+/'), true))[2])->toBe($openGate);

    $document->forceFill(['visitor_password_hash' => Hash::make('123')])->save();

    // Same signature, same expiry — but the gate no longer describes this address.
    expect($token->verify($before))->not->toBeNull()
        ->and(WebSocketTokenService::gate(false, $document->fresh()->visitor_password_hash))->not->toBe($openGate);
});

it('recovers ownership only with the matching recovery key', function (): void {
    paidPrefix();

    $this->post('/recover', [
        'prefix' => 'acme',
        'recovery_key' => 'wrong-key',
        'password' => 'brand new password',
        'password_confirmation' => 'brand new password',
    ])->assertSessionHasErrors('recovery_key');

    $this->post('/recover', [
        'prefix' => 'acme',
        'recovery_key' => 'recovery-key-123',
        'password' => 'brand new password',
        'password_confirmation' => 'brand new password',
    ])->assertRedirect('/acme');

    expect(Hash::check('brand new password', Document::where('slug', 'acme')->first()->owner_password_hash))
        ->toBeTrue();
});
