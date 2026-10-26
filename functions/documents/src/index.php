<?php

declare(strict_types=1);

require_once(__DIR__ . '/../vendor/autoload.php');

use Appwrite\AppwriteException;
use Appwrite\Client;
use Appwrite\ID;
use Appwrite\Models\Row;
use Appwrite\Query;
use Appwrite\Services\TablesDB;
use Dumphere\DocumentHtmlSanitizer;
use Dumphere\DocumentSlug;
use Dumphere\DocumentTree;
use Dumphere\OwnerToken;
use Dumphere\RecoveryKey;
use Dumphere\WebSocketToken;

return function ($context) {
    $databaseId = 'dumphere';
    $documentsTable = 'documents';
    $attemptsTable = 'attempts';
    $maxDocuments = max(1, (int) (getenv('RESERVED_PREFIX_MAX_DOCUMENTS') ?: 50));
    $passwordMaxLength = 200;
    $requestId = $context->req->headers['x-appwrite-execution-id'] ?? '';
    $clientIp = $context->req->headers['x-appwrite-client-ip'] ?? '';

    $json = fn(array $body, int $statusCode = 200) => $context->res->text(
        json_encode($body, JSON_THROW_ON_ERROR),
        $statusCode,
        ['content-type' => 'application/json'],
    );

    $fail = fn(int $statusCode, string $error, array $extra = []) => $json(['error' => $error, ...$extra], $statusCode);

    $tablesDB = new TablesDB(
        (new Client())
            ->setEndpoint(getenv('APPWRITE_FUNCTION_API_ENDPOINT'))
            ->setProject(getenv('APPWRITE_FUNCTION_PROJECT_ID'))
            ->setKey($context->req->headers['x-appwrite-key']),
    );

    $wsTokens = new WebSocketToken((string) getenv('YJS_WS_SECRET'));
    $now = fn(int $offsetSeconds = 0) => gmdate('Y-m-d\TH:i:s.v\Z', time() + $offsetSeconds);

    $findBySlug = fn(string $slug): ?Row => $tablesDB->listRows($databaseId, $documentsTable, [
        Query::equal('slug', [$slug]),
        Query::limit(1),
    ], total: false)->rows[0] ?? null;

    $prefixOwner = fn(string $slug): ?Row => $tablesDB->listRows($databaseId, $documentsTable, [
        Query::equal('slug', [DocumentSlug::root($slug)]),
        Query::greaterThan('reservedUntil', $now()),
        Query::limit(1),
    ], total: false)->rows[0] ?? null;

    $holdsOwnerToken = fn(?Row $owner, array $body): bool => $owner !== null && OwnerToken::matches(
        $body['ownerToken'] ?? null,
        $owner->data['ownerPasswordHash'],
        $owner->data['ownerSessionId'],
    );

    $gateOf = fn(?Row $owner): string => WebSocketToken::gate(
        ($owner?->data['readonly'] ?? false) === true,
        $owner?->data['visitorPasswordHash'] ?? null,
        $owner?->data['ownerSessionId'] ?? null,
    );

    $themeOf = fn(?Row $owner): array => [
        'themeHue' => $owner?->data['themeHue'] ?? null,
        'themeChroma' => $owner?->data['themeChroma'] ?? null,
        'themeHueDark' => $owner?->data['themeHueDark'] ?? null,
        'themeChromaDark' => $owner?->data['themeChromaDark'] ?? null,
    ];

    $notifyCollaboration = function (string $type, string $slug) use ($context) {
        $url = (string) getenv('YJS_NOTIFY_URL');

        if ($url === '') {
            return;
        }

        $sent = @file_get_contents($url, false, stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "content-type: application/json\r\nauthorization: Bearer " . getenv('YJS_WS_SECRET'),
            'content' => json_encode(['type' => $type, 'slug' => $slug], JSON_THROW_ON_ERROR),
            'timeout' => 3,
            'ignore_errors' => true,
        ]]));

        if ($sent === false) {
            $context->error("Could not notify the collaboration server about {$type}.");
        }
    };

    $throttle = function (string $action, int $limit, int $windowSeconds) use ($tablesDB, $databaseId, $attemptsTable, $clientIp, $now): ?int {
        $key = hash('sha256', $action . ':' . $clientIp);
        $recent = $tablesDB->listRows($databaseId, $attemptsTable, [
            Query::equal('key', [$key]),
            Query::createdAfter($now(-$windowSeconds)),
            Query::orderAsc('$createdAt'),
            Query::limit(1),
        ]);

        if ($recent->total >= $limit) {
            return max(1, strtotime($recent->rows[0]->createdAt) + $windowSeconds - time());
        }

        $tablesDB->createRow($databaseId, $attemptsTable, ID::unique(), ['key' => $key]);

        return null;
    };

    $readBody = function () use ($context): ?array {
        $body = json_decode($context->req->bodyText, true);

        return is_array($body) ? $body : null;
    };

    $readSlug = function (array $body, string $field = 'slug'): ?string {
        $slug = is_string($body[$field] ?? null) ? DocumentSlug::normalize($body[$field]) : '';

        return DocumentSlug::isValid($slug) ? $slug : null;
    };

    $toDocument = fn(Row $row) => [
        'id' => $row->id,
        'slug' => $row->data['slug'],
        'title' => $row->data['title'],
        'contentHtml' => $row->data['contentHtml'] ?? '',
        'yjsStateBase64' => $row->data['yjsState'],
        'updatedAt' => $row->updatedAt,
        'createdAt' => $row->createdAt,
    ];

    $countUnder = fn(string $prefix): int => $tablesDB->listRows($databaseId, $documentsTable, [
        Query::or([Query::equal('slug', [$prefix]), Query::startsWith('slug', $prefix . '/')]),
        Query::limit(1),
    ])->total;

    $createDocument = function (string $slug) use ($tablesDB, $databaseId, $documentsTable, $findBySlug, $now): Row {
        try {
            return $tablesDB->createRow($databaseId, $documentsTable, ID::unique(), [
                'slug' => $slug,
                'title' => DocumentTree::headline(basename($slug)),
                'contentHtml' => '',
                'lastAccessedAt' => $now(),
            ]);
        } catch (AppwriteException $error) {
            if ($error->getCode() === 409 && ($existing = $findBySlug($slug)) !== null) {
                return $existing;
            }

            throw $error;
        }
    };

    $open = function () use ($readBody, $readSlug, $fail, $json, $prefixOwner, $holdsOwnerToken, $findBySlug, $throttle, $createDocument, $countUnder, $maxDocuments, $tablesDB, $databaseId, $documentsTable, $now, $themeOf, $gateOf, $toDocument, $wsTokens) {
        $body = $readBody() ?? [];
        $slug = $readSlug($body);

        if ($slug === null) {
            return $fail(404, 'invalidAddress');
        }

        $owner = $prefixOwner($slug);
        $isOwner = $holdsOwnerToken($owner, $body);
        $visitorPassword = is_string($body['visitorPassword'] ?? null) ? $body['visitorPassword'] : '';

        if (!$isOwner && ($owner?->data['visitorPasswordHash'] ?? null) !== null) {
            if ($visitorPassword === '') {
                return $json(['status' => 'locked', 'slug' => $slug, ...$themeOf($owner)]);
            }

            if (($retryAfter = $throttle('unlock', 10, 60)) !== null) {
                return $fail(429, 'tooManyAttempts', ['retryAfter' => $retryAfter]);
            }

            if (!password_verify($visitorPassword, $owner->data['visitorPasswordHash'])) {
                return $fail(422, 'wrongVisitorPassword');
            }
        }

        $document = $findBySlug($slug);

        if ($document === null && $owner !== null && !$isOwner) {
            return $fail(404, 'taken', ['prefix' => $owner->data['slug']]);
        }

        if ($document === null && $owner === null && ($retryAfter = $throttle('create', 10, 3600)) !== null) {
            return $fail(429, 'tooManyAttempts', ['retryAfter' => $retryAfter]);
        }

        if ($document === null && $owner !== null && $countUnder($owner->data['slug']) >= $maxDocuments) {
            return $fail(409, 'pageLimit');
        }

        $document ??= $createDocument($slug);

        if (strtotime((string) $document->data['lastAccessedAt']) < time() - 300) {
            $tablesDB->updateRow($databaseId, $documentsTable, $document->id, ['lastAccessedAt' => $now()]);
        }

        $readonly = ($owner?->data['readonly'] ?? false) === true && !$isOwner;

        return $json([
            'status' => 'ok',
            'document' => $toDocument($document),
            'reserved' => $owner !== null,
            'isOwner' => $isOwner,
            'maxDocuments' => $maxDocuments,
            'readonly' => $readonly,
            'readonlyForVisitors' => ($owner?->data['readonly'] ?? false) === true,
            'lockedForVisitors' => ($owner?->data['visitorPasswordHash'] ?? null) !== null,
            'wsToken' => $wsTokens->generate(
                $document->id,
                $readonly ? WebSocketToken::SCOPE_READ : WebSocketToken::SCOPE_WRITE,
                $gateOf($owner),
            ),
            ...$themeOf($owner),
        ]);
    };

    $save = function () use ($readBody, $readSlug, $fail, $json, $prefixOwner, $holdsOwnerToken, $findBySlug, $gateOf, $wsTokens, $tablesDB, $databaseId, $documentsTable, $now) {
        $body = $readBody();

        if ($body === null || !array_key_exists('contentHtml', $body)) {
            return $fail(400, 'invalidBody');
        }

        $slug = $readSlug($body);
        $document = $slug === null ? null : $findBySlug($slug);

        if ($document === null) {
            return $fail(404, 'notFound');
        }

        $owner = $prefixOwner($slug);

        if (!$holdsOwnerToken($owner, $body)) {
            if (($owner?->data['readonly'] ?? false) === true) {
                return $fail(403, 'readonly');
            }

            if (($owner?->data['visitorPasswordHash'] ?? null) !== null
                && !$wsTokens->matches((string) ($body['wsToken'] ?? ''), $document->id, $gateOf($owner))) {
                return $fail(403, 'locked');
            }
        }

        $contentHtml = is_string($body['contentHtml']) ? $body['contentHtml'] : '';

        if (strlen($contentHtml) > DocumentHtmlSanitizer::MAX_SIZE_BYTES) {
            return $fail(413, 'tooLarge');
        }

        $updated = $tablesDB->updateRow($databaseId, $documentsTable, $document->id, [
            'contentHtml' => (new DocumentHtmlSanitizer())->sanitize($contentHtml),
            'lastAccessedAt' => $now(),
        ]);

        return $json(['success' => true, 'updatedAt' => $updated->updatedAt]);
    };

    $tree = function () use ($readBody, $readSlug, $fail, $json, $prefixOwner, $holdsOwnerToken, $gateOf, $wsTokens, $tablesDB, $databaseId, $documentsTable) {
        $body = $readBody() ?? [];
        $slug = $readSlug($body);

        if ($slug === null) {
            return $fail(404, 'invalidAddress');
        }

        $owner = $prefixOwner($slug);

        if (($owner?->data['visitorPasswordHash'] ?? null) !== null && !$holdsOwnerToken($owner, $body)) {
            $token = (string) ($body['wsToken'] ?? '');
            $documentId = $wsTokens->verify($token);
            $tokenDocument = $documentId === null ? null : $tablesDB->getRow($databaseId, $documentsTable, $documentId, [
                Query::select(['slug']),
            ]);

            if ($tokenDocument === null
                || DocumentSlug::root($tokenDocument->data['slug']) !== $owner->data['slug']
                || !$wsTokens->matches($token, $documentId, $gateOf($owner))) {
                return $fail(403, 'locked');
            }
        }

        $descendants = [];
        $cursor = null;

        do {
            $page = $tablesDB->listRows($databaseId, $documentsTable, [
                Query::startsWith('slug', $slug . '/'),
                Query::select(['slug', 'title']),
                Query::limit(100),
                ...($cursor === null ? [] : [Query::cursorAfter($cursor)]),
            ], total: false)->rows;

            foreach ($page as $row) {
                $descendants[] = ['slug' => $row->data['slug'], 'title' => $row->data['title']];
            }

            $cursor = end($page)->id ?? null;
        } while (count($page) === 100);

        return $json(['children' => DocumentTree::children($slug, $descendants)]);
    };

    $delete = function () use ($readBody, $readSlug, $fail, $json, $prefixOwner, $holdsOwnerToken, $tablesDB, $databaseId, $documentsTable, $notifyCollaboration) {
        $body = $readBody() ?? [];
        $slug = $readSlug($body);
        $owner = $slug === null ? null : $prefixOwner($slug);

        if (!$holdsOwnerToken($owner, $body)) {
            return $fail(403, 'notOwner');
        }

        if ($slug === $owner->data['slug']) {
            return $fail(422, 'rootAddress');
        }

        $removed = $tablesDB->deleteRows($databaseId, $documentsTable, [
            Query::or([Query::equal('slug', [$slug]), Query::startsWith('slug', $slug . '/')]),
        ])->total;

        $notifyCollaboration('deleted', $slug);

        return $json(['removed' => $removed]);
    };

    $settings = function () use ($readBody, $readSlug, $fail, $json, $prefixOwner, $holdsOwnerToken, $throttle, $tablesDB, $databaseId, $documentsTable, $notifyCollaboration, $themeOf, $passwordMaxLength) {
        $body = $readBody() ?? [];
        $slug = $readSlug($body);
        $owner = $slug === null ? null : $prefixOwner($slug);

        if ($owner === null) {
            return $fail(404, 'notFound');
        }

        $carriesToken = $holdsOwnerToken($owner, $body);

        if (!$carriesToken) {
            $password = is_string($body['password'] ?? null) ? $body['password'] : '';

            if ($password === '') {
                return $fail(401, 'passwordRequired');
            }

            if (($retryAfter = $throttle('settings', 10, 60)) !== null) {
                return $fail(429, 'tooManyAttempts', ['retryAfter' => $retryAfter]);
            }

            if ($owner->data['ownerPasswordHash'] === null || !password_verify($password, $owner->data['ownerPasswordHash'])) {
                return $fail(422, 'wrongOwnerPassword');
            }
        }

        $changes = [];

        if (($body['apply'] ?? false) === true) {
            $themeValue = function (string $field, int $max) use ($body, $owner): int|false|null {
                if (!array_key_exists($field, $body)) {
                    return $owner->data[$field];
                }

                $value = $body[$field];

                return $value === null || (is_int($value) && $value >= 0 && $value <= $max) ? $value : false;
            };

            $theme = [
                'themeHue' => $themeValue('themeHue', 359),
                'themeChroma' => $themeValue('themeChroma', 100),
                'themeHueDark' => $themeValue('themeHueDark', 359),
                'themeChromaDark' => $themeValue('themeChromaDark', 100),
            ];
            $visitorPassword = $body['visitorPassword'] ?? null;
            $clearVisitorPassword = $body['clearVisitorPassword'] ?? null;

            if (!is_bool($body['readonly'] ?? null) || !is_bool($clearVisitorPassword) || in_array(false, $theme, true)
                || ($visitorPassword !== null && (!is_string($visitorPassword) || mb_strlen($visitorPassword) > $passwordMaxLength))) {
                return $fail(422, 'invalidSettings');
            }

            $wantsPassword = !$clearVisitorPassword;

            if ($wantsPassword && $owner->data['visitorPasswordHash'] === null && trim((string) $visitorPassword) === '') {
                return $fail(422, 'visitorPasswordRequired');
            }

            $changes = [
                'readonly' => $body['readonly'],
                ...$theme,
                'visitorPasswordHash' => match (true) {
                    $clearVisitorPassword => null,
                    trim((string) $visitorPassword) !== '' => password_hash($visitorPassword, PASSWORD_BCRYPT),
                    default => $owner->data['visitorPasswordHash'],
                },
            ];
        }

        if (!$carriesToken) {
            $changes['ownerSessionId'] = OwnerToken::newSession();
        }

        if ($changes !== []) {
            $owner = $tablesDB->updateRow($databaseId, $documentsTable, $owner->id, $changes);
            $notifyCollaboration('mode', $owner->data['slug']);
        }

        return $json([
            'prefix' => $owner->data['slug'],
            'readonly' => $owner->data['readonly'],
            'hasVisitorPassword' => $owner->data['visitorPasswordHash'] !== null,
            'reservedUntil' => $owner->data['reservedUntil'],
            'ownerToken' => OwnerToken::for($owner->data['ownerPasswordHash'], $owner->data['ownerSessionId']),
            ...$themeOf($owner),
        ]);
    };

    $recover = function () use ($readBody, $readSlug, $fail, $json, $prefixOwner, $throttle, $tablesDB, $databaseId, $documentsTable, $notifyCollaboration, $passwordMaxLength) {
        $body = $readBody() ?? [];
        $prefix = $readSlug($body, 'prefix');
        $recoveryKey = is_string($body['recoveryKey'] ?? null) ? trim($body['recoveryKey']) : '';
        $password = is_string($body['password'] ?? null) ? $body['password'] : '';

        if ($password === '' || mb_strlen($password) > $passwordMaxLength) {
            return $fail(422, 'invalidPassword');
        }

        if ($password !== ($body['passwordConfirmation'] ?? null)) {
            return $fail(422, 'passwordMismatch');
        }

        if (($retryAfter = $throttle('recover', 5, 60)) !== null) {
            return $fail(429, 'tooManyAttempts', ['retryAfter' => $retryAfter]);
        }

        $owner = $prefix === null ? null : $prefixOwner($prefix);

        if ($owner === null || !RecoveryKey::matches($recoveryKey, $owner->data['ownerRecoveryKeyHash'])) {
            return $fail(422, 'recoveryKeyMismatch');
        }

        $owner = $tablesDB->updateRow($databaseId, $documentsTable, $owner->id, [
            'ownerPasswordHash' => password_hash($password, PASSWORD_BCRYPT),
            'ownerSessionId' => OwnerToken::newSession(),
        ]);
        $notifyCollaboration('mode', $owner->data['slug']);

        return $json([
            'prefix' => $owner->data['slug'],
            'ownerToken' => OwnerToken::for($owner->data['ownerPasswordHash'], $owner->data['ownerSessionId']),
        ]);
    };

    $routes = [
        '/open' => $open,
        '/save' => $save,
        '/tree' => $tree,
        '/delete' => $delete,
        '/settings' => $settings,
        '/recover' => $recover,
    ];

    try {
        $route = $routes[$context->req->path] ?? null;

        if ($route === null) {
            return $fail(404, 'routeNotFound');
        }

        return $context->req->method === 'POST' ? $route() : $fail(405, 'methodNotAllowed');
    } catch (Throwable $error) {
        if ($error instanceof AppwriteException && $error->getCode() === 404) {
            return $fail(404, 'notFound');
        }

        $context->error("{$requestId} " . $error::class . ": {$error->getMessage()}");

        return $fail(500, 'unexpected', ['requestId' => $requestId]);
    }
};
