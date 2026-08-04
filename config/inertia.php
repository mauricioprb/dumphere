<?php

declare(strict_types=1);

return [
    // Merged shallowly over the package defaults, so this key must be complete.
    // The package looks for `js/pages`; this app capitalises the directory.
    'pages' => [
        'ensure_pages_exist' => false,
        'paths' => [
            resource_path('js/Pages'),
        ],
        'extensions' => ['vue'],
    ],

    // Defaults to true in the package, and there is no SSR bundle here.
    'ssr' => [
        'enabled' => false,
    ],
];
