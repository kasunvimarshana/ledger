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

        $now = Carbon::now();
        
        // Define rate data for each product with historical rates
        $rateData = [
            'Coconuts' => [
                ['rate' => 25.50, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(9), 'effective_to' => $now->copy()->subMonths(6)->subDay()],
                ['rate' => 27.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(6), 'effective_to' => $now->copy()->subMonths(3)->subDay()],
                ['rate' => 28.50, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(3), 'effective_to' => null],
                ['rate' => 1.50, 'unit' => 'piece', 'effective_from' => $now->copy()->subMonths(9), 'effective_to' => null],
            ],
            'Latex' => [
                ['rate' => 150.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(9), 'effective_to' => $now->copy()->subMonths(6)->subDay()],
                ['rate' => 155.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(6), 'effective_to' => $now->copy()->subMonths(3)->subDay()],
                ['rate' => 160.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(3), 'effective_to' => null],
            ],
            'Palm Oil' => [
                ['rate' => 85.00, 'unit' => 'liter', 'effective_from' => $now->copy()->subMonths(8), 'effective_to' => $now->copy()->subMonths(4)->subDay()],
                ['rate' => 88.00, 'unit' => 'liter', 'effective_from' => $now->copy()->subMonths(4), 'effective_to' => null],
            ],
            'Cocoa Beans' => [
                ['rate' => 250.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(9), 'effective_to' => $now->copy()->subMonths(5)->subDay()],
                ['rate' => 265.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(5), 'effective_to' => null],
            ],
            'Coffee Beans' => [
                ['rate' => 180.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(8), 'effective_to' => $now->copy()->subMonths(4)->subDay()],
                ['rate' => 190.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(4), 'effective_to' => null],
            ],
            'Tea Leaves' => [
                ['rate' => 45.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(9), 'effective_to' => $now->copy()->subMonths(6)->subDay()],
                ['rate' => 48.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(6), 'effective_to' => null],
            ],
            'Cashew Nuts' => [
                ['rate' => 320.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(9), 'effective_to' => $now->copy()->subMonths(5)->subDay()],
                ['rate' => 335.00, 'unit' => 'kg', 'effective_from' => $now->copy()->subMonths(5), 'effective_to' => null],
            ],
        ];

        foreach ($products as $product) {
            if (isset($rateData[$product->name])) {
                foreach ($rateData[$product->name] as $index => $rate) {
                    Rate::create([
                        'product_id' => $product->id,
                        'rate' => $rate['rate'],
                        'unit' => $rate['unit'],
                        'effective_from' => $rate['effective_from'],
                        'effective_to' => $rate['effective_to'],
                        'is_active' => $rate['effective_to'] === null,
                        'version' => $index + 1,
                    ]);
                }
            }
        }

        $this->command->info('Rates seeded successfully!');
    }
}
