<?php

namespace App\Observers;

use App\Models\Product;

class ProductObserver
{
    /**
     * Handle the Product "updating" event.
     * Increment version for optimistic locking
     */
    public function updating(Product $product): void
    {
        // Increment version on every update
        if ($product->isDirty() && !$product->isDirty('version')) {
            $product->version = ($product->version ?? 0) + 1;
        }
    }

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        // Ensure version starts at 1
        if (!$product->version) {
            $product->version = 1;
            $product->saveQuietly(); // Save without triggering events
        }
    }
}
