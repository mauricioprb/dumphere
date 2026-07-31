<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$environmentPath = $root.'/.env';
$examplePath = $root.'/.env.example';

if (! is_file($environmentPath) && ! copy($examplePath, $environmentPath)) {
    throw new RuntimeException('Não foi possível criar o arquivo .env.');
}

$contents = file_get_contents($environmentPath);

if ($contents === false) {
    throw new RuntimeException('Não foi possível ler o arquivo .env.');
}

foreach (['APP_KEY', 'YJS_WS_SECRET'] as $variable) {
    $pattern = '/^'.preg_quote($variable, '/').'=(.*)$/m';

    if (preg_match($pattern, $contents, $matches) !== 1) {
        $contents = rtrim($contents).PHP_EOL.$variable.'='.PHP_EOL;
        $matches = ['', ''];
    }

    if (trim($matches[1]) === '') {
        $secret = 'base64:'.base64_encode(random_bytes(32));
        $contents = preg_replace($pattern, $variable.'='.$secret, $contents, 1);
    }
}

if ($contents === null || file_put_contents($environmentPath, $contents, LOCK_EX) === false) {
    throw new RuntimeException('Não foi possível atualizar os segredos locais no arquivo .env.');
}
