<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'amount' => fake()->randomFloat(2, 1000, 10000),
            'payment_type' => fake()->randomElement(['advance', 'partial', 'full']),
            'payment_date' => now()->subDays(rand(0, 30)),
            'reference' => 'PAY' . fake()->unique()->numberBetween(10000, 99999),
            'notes' => fake()->optional()->sentence(),
            'version' => 1,
        ];
    }
}
