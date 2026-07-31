<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Document\Actions\PurgeStaleDocuments;
use Illuminate\Console\Command;

class PurgeStaleDocumentsCommand extends Command
{
    protected $signature = 'documents:purge {--days=30 : Number of days of inactivity before purging}';

    protected $description = 'Purge documents that have not been accessed within the specified number of days.';

    public function handle(PurgeStaleDocuments $purgeAction): int
    {
        $days = (int) $this->option('days');

        if ($days < 1) {
            $this->error('The number of days must be at least 1.');

            return self::FAILURE;
        }

        $this->info("Purging documents not accessed in the last {$days} days...");

        $count = $purgeAction->execute($days);

        $this->info("Purged {$count} stale document(s).");

        return self::SUCCESS;
    }
}
