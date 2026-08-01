<?php

declare(strict_types=1);

it('uses the Dumphere repository by default', function (): void {
    $recipe = file_get_contents(dirname(__DIR__, 2) . '/deploy.php');

    expect($recipe)
        ->not->toBeFalse()
        ->toContain("getenv('DEPLOY_REPOSITORY') ?: 'git@github.com:mauricioprb/dumphere.git'");
});
