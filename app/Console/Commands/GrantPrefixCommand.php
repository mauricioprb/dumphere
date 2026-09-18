<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Document;
use App\Support\DocumentSlug;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

use function Laravel\Prompts\password as promptPassword;

class GrantPrefixCommand extends Command
{
    protected $signature = 'prefix:grant
        {address : The address to reserve, without slashes (for example: acme)}
        {--password= : Owner password; asked for when omitted}
        {--years=100 : How long the address stays reserved}
        {--readonly : Leave the address read-only for visitors}
        {--visitor-password= : Require this password to visit}
        {--hue= : Fixed palette hue, 0 to 359}
        {--saturation= : Palette saturation, 0 to 100}';

    protected $description = 'Reserve a special address for an owner.';

    public function handle(): int
    {
        $address = DocumentSlug::normalize((string) $this->argument('address'));

        if (str_contains($address, '/') || ! DocumentSlug::isValid($address)) {
            $this->error('The address must be a single valid segment, such as "acme".');

            return self::FAILURE;
        }

        $years = (int) $this->option('years');
        $hue = $this->numericOption('hue', 0, 359);
        $saturation = $this->numericOption('saturation', 0, 100);

        if ($years < 1 || $hue === false || $saturation === false) {
            $this->error('Years must be at least 1, hue between 0 and 359, saturation between 0 and 100.');

            return self::FAILURE;
        }

        $password = (string) ($this->option('password') ?: promptPassword('Owner password'));

        if (trim($password) === '') {
            $this->error('An owner password is required.');

            return self::FAILURE;
        }

        $document = Document::firstOrCreate(
            ['slug' => $address],
            ['title' => ucwords(str_replace('-', ' ', $address)), 'content_html' => ''],
        );

        $visitorPassword = (string) $this->option('visitor-password');

        $document->forceFill([
            'reserved_until' => now()->addYears($years),
            'owner_password_hash' => Hash::make($password),
            'owner_session_id' => null,
            'readonly' => (bool) $this->option('readonly'),
            'visitor_password_hash' => $visitorPassword === '' ? null : Hash::make($visitorPassword),
            'theme_hue' => $hue,
            'theme_chroma' => $saturation,
            'last_accessed_at' => now(),
        ])->save();

        $document->announceRulesChanged();

        $this->info("Address /{$address} reserved until {$document->reserved_until->toDateString()}.");
        $this->table(
            ['setting', 'value'],
            [
                ['read-only for visitors', $document->readonly ? 'yes' : 'no'],
                ['visitor password', $document->visitor_password_hash === null ? 'none' : 'set'],
                ['palette', $hue === null ? 'daily' : "hue {$hue}, saturation " . ($saturation ?? 100) . '%'],
            ],
        );

        return self::SUCCESS;
    }

    /** @return int|null|false The value, null when absent, or false when out of range. */
    private function numericOption(string $name, int $min, int $max): int|null|false
    {
        $value = $this->option($name);

        if ($value === null || $value === '') {
            return null;
        }

        $number = (int) $value;

        return $number >= $min && $number <= $max ? $number : false;
    }
}
