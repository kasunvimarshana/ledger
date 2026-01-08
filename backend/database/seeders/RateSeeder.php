<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Rate;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::where('is_active', true)->get();

        if ($products->isEmpty()) {
            $this->command->warn('No active products found. Please run ProductSeeder first.');
            return;
        }

        // Define rate data for each product with historical rates
        $rateData = [
            'Coconuts' => [
                ['rate' => 25.50, 'unit' => 'kg', 'effective_from' => '2025-01-01', 'effective_to' => '2025-03-31'],
                ['rate' => 27.00, 'unit' => 'kg', 'effective_from' => '2025-04-01', 'effective_to' => '2025-06-30'],
                ['rate' => 28.50, 'unit' => 'kg', 'effective_from' => '2025-07-01', 'effective_to' => null],
                ['rate' => 1.50, 'unit' => 'piece', 'effective_from' => '2025-01-01', 'effective_to' => null],
            ],
            'Latex' => [
                ['rate' => 150.00, 'unit' => 'kg', 'effective_from' => '2025-01-01', 'effective_to' => '2025-03-31'],
                ['rate' => 155.00, 'unit' => 'kg', 'effective_from' => '2025-04-01', 'effective_to' => '2025-06-30'],
                ['rate' => 160.00, 'unit' => 'kg', 'effective_from' => '2025-07-01', 'effective_to' => null],
            ],
            'Palm Oil' => [
                ['rate' => 85.00, 'unit' => 'liter', 'effective_from' => '2025-01-01', 'effective_to' => '2025-04-30'],
                ['rate' => 88.00, 'unit' => 'liter', 'effective_from' => '2025-05-01', 'effective_to' => null],
            ],
            'Cocoa Beans' => [
                ['rate' => 250.00, 'unit' => 'kg', 'effective_from' => '2025-01-01', 'effective_to' => '2025-05-31'],
                ['rate' => 265.00, 'unit' => 'kg', 'effective_from' => '2025-06-01', 'effective_to' => null],
            ],
            'Coffee Beans' => [
                ['rate' => 180.00, 'unit' => 'kg', 'effective_from' => '2025-01-01', 'effective_to' => '2025-04-30'],
                ['rate' => 190.00, 'unit' => 'kg', 'effective_from' => '2025-05-01', 'effective_to' => null],
            ],
            'Tea Leaves' => [
                ['rate' => 45.00, 'unit' => 'kg', 'effective_from' => '2025-01-01', 'effective_to' => '2025-06-30'],
                ['rate' => 48.00, 'unit' => 'kg', 'effective_from' => '2025-07-01', 'effective_to' => null],
            ],
            'Cashew Nuts' => [
                ['rate' => 320.00, 'unit' => 'kg', 'effective_from' => '2025-01-01', 'effective_to' => '2025-05-31'],
                ['rate' => 335.00, 'unit' => 'kg', 'effective_from' => '2025-06-01', 'effective_to' => null],
            ],
        ];

        foreach ($products as $product) {
            if (isset($rateData[$product->name])) {
                foreach ($rateData[$product->name] as $index => $rate) {
                    Rate::create([
                        'product_id' => $product->id,
                        'rate' => $rate['rate'],
                        'unit' => $rate['unit'],
                        'effective_from' => Carbon::parse($rate['effective_from']),
                        'effective_to' => $rate['effective_to'] ? Carbon::parse($rate['effective_to']) : null,
                        'is_active' => $rate['effective_to'] === null,
                        'version' => $index + 1,
                    ]);
                }
            }
        }

        $this->command->info('Rates seeded successfully!');
    }
}
