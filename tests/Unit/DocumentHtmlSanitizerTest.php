<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Domain\Document\Services\DocumentHtmlSanitizer;
use PHPUnit\Framework\TestCase;

class DocumentHtmlSanitizerTest extends TestCase
{
    public function test_it_removes_executable_html_and_unsafe_urls(): void
    {
        $unsafe = <<<'HTML'
        <p onclick="alert(1)">Visible</p>
        <script>alert(1)</script>
        <img src="javascript:alert(1)" onerror="alert(1)" style="background:url(https://evil.example)">
        <img src="data:image/svg+xml,&lt;svg onload='alert(1)'&gt;">
        <a href="javascript:alert(1)" target="_blank" style="position:fixed">Link</a>
        <iframe src="https://evil.example"></iframe>
        HTML;

        $sanitized = (new DocumentHtmlSanitizer)->sanitize($unsafe);

        $this->assertStringContainsString('<p>Visible</p>', $sanitized);
        $this->assertStringNotContainsString('script', $sanitized);
        $this->assertStringNotContainsString('onclick', $sanitized);
        $this->assertStringNotContainsString('onerror', $sanitized);
        $this->assertStringNotContainsString('javascript:', $sanitized);
        $this->assertStringNotContainsString('data:image', $sanitized);
        $this->assertStringNotContainsString('iframe', $sanitized);
        $this->assertStringNotContainsString('position:', $sanitized);
        $this->assertStringContainsString('rel="noopener noreferrer"', $sanitized);
    }

    public function test_it_preserves_the_supported_tiptap_schema(): void
    {
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

        $this->assertStringContainsString('data-type="taskList"', $sanitized);
        $this->assertStringContainsString('data-type="taskItem"', $sanitized);
        $this->assertStringContainsString('data-checked="true"', $sanitized);
        $this->assertStringContainsString('class="language-php"', $sanitized);
        $this->assertStringContainsString('style="min-width: 150px"', $sanitized);
        $this->assertStringContainsString('style="width: 75px"', $sanitized);
        $this->assertStringContainsString('style="text-align: center"', $sanitized);
        $this->assertStringNotContainsString('background:', $sanitized);
        $this->assertStringNotContainsString('position:', $sanitized);
        $this->assertStringNotContainsString('onload', $sanitized);
    }
}
