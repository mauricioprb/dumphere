<?php

declare(strict_types=1);

require_once(__DIR__ . '/../vendor/autoload.php');

use Appwrite\Client;
use Appwrite\ID;
use Appwrite\Query;
use Appwrite\Services\TablesDB;
use Dumphere\DocumentSlug;
use Dumphere\RecoveryKey;

return function ($context) {
    $databaseId = 'dumphere';
    $documentsTable = 'documents';
    $attemptsTable = 'attempts';
    $staleDays = 30;
    $batchSize = 100;
    $requestId = $context->req->headers['x-appwrite-execution-id'] ?? '';

    $json = fn(array $body, int $statusCode = 200) => $context->res->text(
        json_encode($body, JSON_THROW_ON_ERROR),
        $statusCode,
        ['content-type' => 'application/json'],
    );

    $tablesDB = new TablesDB(
        (new Client())
            ->setEndpoint(getenv('APPWRITE_FUNCTION_API_ENDPOINT'))
            ->setProject(getenv('APPWRITE_FUNCTION_PROJECT_ID'))
            ->setKey($context->req->headers['x-appwrite-key']),
    );

    $now = fn(int $offsetSeconds = 0) => gmdate('Y-m-d\TH:i:s.v\Z', time() + $offsetSeconds);

    $notifyCollaboration = function (string $slug) use ($context) {
        $url = (string) getenv('YJS_NOTIFY_URL');

        if ($url === '') {
            return;
        }

        $sent = @file_get_contents($url, false, stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "content-type: application/json\r\nauthorization: Bearer " . getenv('YJS_WS_SECRET'),
            'content' => json_encode(['type' => 'mode', 'slug' => $slug], JSON_THROW_ON_ERROR),
            'timeout' => 3,
            'ignore_errors' => true,
        ]]));

        if ($sent === false) {
            $context->error('Could not notify the collaboration server.');
        }
    };

    $purge = function () use ($tablesDB, $databaseId, $documentsTable, $attemptsTable, $staleDays, $batchSize, $now, $json, $context) {
        $reservedRoots = [];
        $cursor = null;

        do {
            $page = $tablesDB->listRows($databaseId, $documentsTable, [
                Query::greaterThan('reservedUntil', $now()),
                Query::select(['slug']),
                Query::limit($batchSize),
                ...($cursor === null ? [] : [Query::cursorAfter($cursor)]),
            ], total: false)->rows;

            foreach ($page as $row) {
                $reservedRoots[$row->data['slug']] = true;
            }

            $cursor = end($page)->id ?? null;
        } while (count($page) === $batchSize);

        $removed = 0;
        $cursor = null;

        do {
            $page = $tablesDB->listRows($databaseId, $documentsTable, [
                Query::lessThan('lastAccessedAt', $now(-$staleDays * 86400)),
                Query::select(['slug']),
                Query::limit($batchSize),
                ...($cursor === null ? [] : [Query::cursorAfter($cursor)]),
            ], total: false)->rows;

            foreach ($page as $row) {
                if (!isset($reservedRoots[DocumentSlug::root($row->data['slug'])])) {
                    $tablesDB->deleteRow($databaseId, $documentsTable, $row->id);
                    $removed++;
                }
            }

            $cursor = end($page)->id ?? null;
        } while (count($page) === $batchSize);

        $attempts = $tablesDB->deleteRows($databaseId, $attemptsTable, [
            Query::createdBefore($now(-86400)),
        ])->total;

        $context->log("Purged {$removed} stale documents and {$attempts} old attempts.");

        return $json(['removedDocuments' => $removed, 'removedAttempts' => $attempts]);
    };

    $grant = function () use ($context, $tablesDB, $databaseId, $documentsTable, $now, $json, $notifyCollaboration) {
        $body = json_decode($context->req->bodyText, true);

        if (!is_array($body)) {
            return $json(['error' => 'Send the address settings as JSON.'], 400);
        }

        $address = is_string($body['address'] ?? null) ? DocumentSlug::normalize($body['address']) : '';
        $password = is_string($body['password'] ?? null) ? $body['password'] : '';
        $visitorPassword = is_string($body['visitorPassword'] ?? null) ? $body['visitorPassword'] : '';
        $years = $body['years'] ?? 100;
        $hue = $body['hue'] ?? null;
        $saturation = $body['saturation'] ?? null;

        if (str_contains($address, '/') || !DocumentSlug::isValid($address)) {
            return $json(['error' => 'The address must be a single valid segment, such as "acme".'], 422);
        }

        if (trim($password) === '') {
            return $json(['error' => 'An owner password is required.'], 422);
        }

        if (!is_int($years) || $years < 1 || $years > 100
            || ($hue !== null && (!is_int($hue) || $hue < 0 || $hue > 359))
            || ($saturation !== null && (!is_int($saturation) || $saturation < 0 || $saturation > 100))) {
            return $json(['error' => 'Years must be between 1 and 100, hue between 0 and 359, saturation between 0 and 100.'], 422);
        }

        $recoveryKey = RecoveryKey::generate();
        $reservedUntil = gmdate('Y-m-d\TH:i:s.v\Z', strtotime("+{$years} years"));
        $existing = $tablesDB->listRows($databaseId, $documentsTable, [
            Query::equal('slug', [$address]),
            Query::limit(1),
        ], total: false)->rows[0] ?? null;

        $fields = [
            'reservedUntil' => $reservedUntil,
            'ownerPasswordHash' => password_hash($password, PASSWORD_BCRYPT),
            'ownerRecoveryKeyHash' => RecoveryKey::digest($recoveryKey),
            'ownerSessionId' => null,
            'readonly' => ($body['readonly'] ?? false) === true,
            'visitorPasswordHash' => $visitorPassword === '' ? null : password_hash($visitorPassword, PASSWORD_BCRYPT),
            'themeHue' => $hue,
            'themeChroma' => $saturation,
            'lastAccessedAt' => $now(),
        ];

        $existing === null
            ? $tablesDB->createRow($databaseId, $documentsTable, ID::unique(), [
                'slug' => $address,
                'title' => ucwords(str_replace('-', ' ', $address)),
                'contentHtml' => '',
                ...$fields,
            ])
            : $tablesDB->updateRow($databaseId, $documentsTable, $existing->id, $fields);

        $notifyCollaboration($address);

        return $json([
            'address' => $address,
            'reservedUntil' => $reservedUntil,
            'recoveryKey' => $recoveryKey,
        ]);
    };

    try {
        if (($context->req->headers['x-appwrite-trigger'] ?? '') === 'schedule') {
            return $purge();
        }

        return match ([$context->req->method, $context->req->path]) {
            ['POST', '/grant'] => $grant(),
            ['POST', '/purge'] => $purge(),
            default => $json(['error' => 'Use POST /grant or POST /purge.'], 404),
        };
    } catch (Throwable $error) {
        $context->error("{$requestId} " . $error::class . ": {$error->getMessage()}");

        return $json(['error' => 'The operation failed.', 'requestId' => $requestId], 500);
    }
};
