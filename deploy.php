<?php

declare(strict_types=1);

namespace Deployer;

use RuntimeException;

require 'recipe/laravel.php';

set('application', 'dumphere');
set('repository', getenv('DEPLOY_REPOSITORY') ?: 'git@github.com:mauricioprb/dumphere.git');
set('branch', getenv('DEPLOY_BRANCH') ?: 'main');
set('keep_releases', 5);
set('default_timeout', 900);
set('yjs_service', getenv('DEPLOY_YJS_SERVICE') ?: 'md-editor-yjs');
set('healthcheck_url', getenv('DEPLOY_HEALTHCHECK_URL') ?: '');

if (($remotePath = getenv('DEPLOY_REMOTE_PATH')) !== false && $remotePath !== '') {
    set('env', ['PATH' => $remotePath]);
}

$production = host('production')
    ->setHostname(getenv('DEPLOY_HOST') ?: 'production.example.com')
    ->setRemoteUser(getenv('DEPLOY_USER') ?: 'deploy')
    ->setDeployPath(getenv('DEPLOY_PATH') ?: '/var/www/dumphere')
    ->setSshMultiplexing(true);

if (($port = getenv('DEPLOY_PORT')) !== false && $port !== '') {
    $production->setPort($port);
}

if (($identityFile = getenv('DEPLOY_IDENTITY_FILE')) !== false && $identityFile !== '') {
    $production->setIdentityFile($identityFile);
}

desc('Validates the production host and shared environment');
task('deploy:check:environment', function (): void {
    foreach (['curl', 'node', 'npm', 'php'] as $binary) {
        if (! commandExist($binary)) {
            throw new RuntimeException("Required remote binary not found: {$binary}");
        }
    }

    if (! test('[ -s {{deploy_path}}/shared/.env ]')) {
        throw new RuntimeException('Create {{deploy_path}}/shared/.env before the first deploy.');
    }

    if (! test("grep -Eq '^APP_ENV=production$' {{deploy_path}}/shared/.env")) {
        throw new RuntimeException('The production .env must contain APP_ENV=production.');
    }

    if (! test("grep -Eq '^APP_DEBUG=(false|\\(false\\)|0)$' {{deploy_path}}/shared/.env")) {
        throw new RuntimeException('The production .env must disable APP_DEBUG.');
    }

    $securityValidation = <<<'SH'
        set -eu
        env_file={{deploy_path}}/shared/.env

        require_exact() {
            key="$1"
            expected="$2"

            if ! grep -Fqx "${key}=${expected}" "$env_file"; then
                echo "The production .env must set ${key}=${expected}." >&2
                exit 1
            fi
        }

        require_value() {
            key="$1"

            if ! grep -Eq "^${key}=.+" "$env_file"; then
                echo "The production .env must define ${key}." >&2
                exit 1
            fi
        }

        for key in APP_KEY YJS_WS_SECRET YJS_ALLOWED_ORIGINS; do
            require_value "$key"
        done

        require_exact SESSION_DRIVER cookie
        require_exact SESSION_ENCRYPT true
        require_exact SESSION_SECURE_COOKIE true
        require_exact HOST 127.0.0.1
        require_exact YJS_TRUST_PROXY true

        app_key=$(sed -n 's/^APP_KEY=//p' "$env_file" | head -n 1)
        yjs_secret=$(sed -n 's/^YJS_WS_SECRET=//p' "$env_file" | head -n 1)

        if [ "$app_key" = "$yjs_secret" ]; then
            echo "APP_KEY and YJS_WS_SECRET must be different." >&2
            exit 1
        fi

        if [ "${#app_key}" -lt 32 ] || [ "${#yjs_secret}" -lt 32 ]; then
            echo "APP_KEY and YJS_WS_SECRET must each contain at least 32 characters." >&2
            exit 1
        fi

        if printf '%s\n%s\n' "$app_key" "$yjs_secret" | grep -Eqi '(dev|test|example|change-me|not-for-production)'; then
            echo "Production secrets must not contain development or placeholder markers." >&2
            exit 1
        fi

        SH;

    run($securityValidation);
});

desc('Builds the production frontend');
task('deploy:assets', function (): void {
    within('{{release_path}}', function (): void {
        run('npm ci --no-audit --no-fund');
        run('npm run build');
        run('rm -rf node_modules');
    });
});

desc('Installs production dependencies for the Yjs server');
task('deploy:yjs:vendors', function (): void {
    within('{{release_path}}', function (): void {
        run('npm --prefix yjs-server ci --omit=dev --omit=optional --no-audit --no-fund');
    });
});

desc('Enables maintenance mode');
task('deploy:maintenance:enable', function (): void {
    run('{{bin/php}} {{release_path}}/artisan down --retry=60');
});

desc('Disables maintenance mode');
task('deploy:maintenance:disable', function (): void {
    run('{{bin/php}} {{current_path}}/artisan up');
});

desc('Restarts the Yjs service');
task('deploy:restart:yjs', function (): void {
    $service = (string) get('yjs_service');

    if (preg_match('/^[A-Za-z0-9@_.-]+$/', $service) !== 1) {
        throw new RuntimeException('Invalid systemd service name.');
    }

    $service = escapeshellarg($service);
    run("sudo -n systemctl restart {$service}");
    run("sudo -n systemctl is-active --quiet {$service}");
});

desc('Checks the newly published application');
task('deploy:health', function (): void {
    $url = (string) get('healthcheck_url');

    if (
        filter_var($url, FILTER_VALIDATE_URL) === false
        || parse_url($url, PHP_URL_SCHEME) !== 'https'
    ) {
        throw new RuntimeException('DEPLOY_HEALTHCHECK_URL must be a valid HTTPS URL.');
    }

    run('curl --fail --silent --show-error --retry 5 --retry-delay 2 ' . escapeshellarg($url));
});

desc('Unlocks deployment and removes maintenance mode after a failure');
task('deploy:failed:recover', function (): void {
    run('rm -f {{deploy_path}}/.dep/deploy.lock');

    if (test('[ -f {{current_path}}/artisan ]')) {
        run('{{bin/php}} {{current_path}}/artisan up');
    }
});

desc('Deploys Dumphere to production');
task('deploy', [
    'deploy:prepare',
    'deploy:check:environment',
    'deploy:vendors',
    'deploy:assets',
    'deploy:yjs:vendors',
    'artisan:storage:link',
    'deploy:maintenance:enable',
    'artisan:migrate',
    'artisan:optimize',
    'deploy:symlink',
    'deploy:restart:yjs',
    'deploy:maintenance:disable',
    'deploy:health',
    'deploy:unlock',
    'deploy:cleanup',
    'deploy:success',
]);

fail('deploy', 'deploy:failed:recover');
after('rollback', 'deploy:restart:yjs');
