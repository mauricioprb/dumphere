<?php

declare(strict_types=1);

return [
    'pages' => [
        'ensure_pages_exist' => false,
        'paths' => [
            resource_path('js/Pages'),
        ],
        'extensions' => ['vue'],
    ],

    'ssr' => [
        'enabled' => false,
    ],
];
