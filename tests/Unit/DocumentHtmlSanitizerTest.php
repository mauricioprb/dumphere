<?php

declare(strict_types=1);

use App\Support\DocumentHtmlSanitizer;

it('removes executable html and unsafe urls', function (): void {
    $unsafe = <<<'HTML'
    <p onclick="alert(1)">Visible</p>
    <script>alert(1)</script>
    <img src="javascript:alert(1)" onerror="alert(1)" style="background:url(https://evil.example)">
    <img src="data:image/svg+xml,&lt;svg onload='alert(1)'&gt;">
    <a href="javascript:alert(1)" target="_blank" style="position:fixed">Link</a>
    <iframe src="https://evil.example"></iframe>
    HTML;

    $sanitized = (new DocumentHtmlSanitizer)->sanitize($unsafe);

    expect($sanitized)
        ->toContain('<p>Visible</p>')
        ->not->toContain('script')
        ->not->toContain('onclick')
        ->not->toContain('onerror')
        ->not->toContain('javascript:')
        ->not->toContain('data:image')
        ->not->toContain('iframe')
        ->not->toContain('position:')
        ->toContain('rel="noopener noreferrer"');
});

it('preserves the supported tiptap schema', function (): void {
    $html = <<<'HTML'
    <h2>Plan</h2>
    <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true"><p>Ship safely</p></li>
    </ul>
    <pre><code class="language-php">&lt;?php echo 'ok';</code></pre>
    <table style="min-width: 150px; background: url(https://evil.example)">
        <colgroup><col style="width: 75px; color: red"></colgroup>
        <tbody><tr><td colwidth="75" style="text-align: center; position: fixed"><p>Cell</p></td></tr></tbody>
    </table>
    <img src="https://example.com/image.png" alt="Example" onload="alert(1)">
    HTML;

    $sanitized = (new DocumentHtmlSanitizer)->sanitize($html);

    expect($sanitized)
        ->toContain('data-type="taskList"')
        ->toContain('data-type="taskItem"')
        ->toContain('data-checked="true"')
        ->toContain('class="language-php"')
        ->toContain('style="min-width: 150px"')
        ->toContain('style="width: 75px"')
        ->toContain('style="text-align: center"')
        ->not->toContain('background:')
        ->not->toContain('position:')
        ->not->toContain('onload');
});
