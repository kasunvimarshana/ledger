<?php

namespace App\Observers;

use App\Models\Rate;

class RateObserver
{
    /**
     * Handle the Rate "updating" event.
     * Increment version for optimistic locking
     */
    public function updating(Rate $rate): void
    {
        // Increment version on every update
        if ($rate->isDirty() && !$rate->isDirty('version')) {
            $rate->version = ($rate->version ?? 0) + 1;
        }
    }

    /**
     * Handle the Rate "created" event.
     */
    public function created(Rate $rate): void
    {
        // Ensure version starts at 1
        if (!$rate->version) {
            $rate->version = 1;
            $rate->saveQuietly(); // Save without triggering events
        }
    }
}
