<?php

namespace App\Observers;

use App\Models\Payment;

class PaymentObserver
{
    /**
     * Handle the Payment "updating" event.
     * Increment version for optimistic locking
     */
    public function updating(Payment $payment): void
    {
        // Increment version on every update
        if ($payment->isDirty() && !$payment->isDirty('version')) {
            $payment->version = ($payment->version ?? 0) + 1;
        }
    }

    /**
     * Handle the Payment "created" event.
     */
    public function created(Payment $payment): void
    {
        // Ensure version starts at 1
        if (!$payment->version) {
            $payment->version = 1;
            $payment->saveQuietly(); // Save without triggering events
        }
    }
}
