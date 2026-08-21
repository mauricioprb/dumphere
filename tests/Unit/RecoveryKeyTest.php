<?php

declare(strict_types=1);

use App\Support\RecoveryKey;

it('generates a high entropy key and stores only its digest', function (): void {
    $key = RecoveryKey::generate();
    $digest = RecoveryKey::digest($key);

    expect($key)->toHaveLength(40)
        ->and($digest)->toHaveLength(64)
        ->and($digest)->not->toContain($key)
        ->and(RecoveryKey::matches($key, $digest))->toBeTrue()
        ->and(RecoveryKey::matches('wrong-key', $digest))->toBeFalse()
        ->and(RecoveryKey::matches($key, null))->toBeFalse();
});
