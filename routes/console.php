<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schedule;

Schedule::command('documents:purge')
    ->dailyAt('03:00')
    ->withoutOverlapping();
