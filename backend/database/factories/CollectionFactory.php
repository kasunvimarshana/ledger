<?php

namespace Database\Factories;

use App\Models\Collection;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use Illuminate\Database\Eloquent\Factories\Factory;

class CollectionFactory extends Factory
{
    protected $model = Collection::class;

    public function definition(): array
    {
        $quantity = fake()->randomFloat(2, 10, 100);
        $rate = fake()->randomFloat(2, 100, 500);
        
        return [
            'supplier_id' => Supplier::factory(),
            'product_id' => Product::factory(),
            'rate_id' => Rate::factory(),
            'quantity' => $quantity,
            'unit' => 'kg',
            'amount' => $quantity * $rate,
            'collection_date' => now()->subDays(rand(0, 30)),
            'notes' => fake()->optional()->sentence(),
            'version' => 1,
        ];
    }
}
