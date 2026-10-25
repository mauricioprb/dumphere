<?php

declare(strict_types=1);

use Dumphere\OwnerToken;

it('accepts only the token of the current owner session', function (): void {
    $token = OwnerToken::for('hash', 'session');

    expect(OwnerToken::matches($token, 'hash', 'session'))->toBeTrue()
        ->and(OwnerToken::matches($token, 'hash', OwnerToken::newSession()))->toBeFalse()
        ->and(OwnerToken::matches($token, 'new-hash', 'session'))->toBeFalse()
        ->and(OwnerToken::matches('', 'hash', 'session'))->toBeFalse()
        ->and(OwnerToken::matches(['array'], 'hash', 'session'))->toBeFalse()
        ->and(OwnerToken::matches($token, null, 'session'))->toBeFalse();
});
