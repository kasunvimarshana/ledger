<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = Supplier::where('is_active', true)->get();
        $products = Product::where('is_active', true)->get();
        $users = User::where('is_active', true)->get();

        if ($suppliers->isEmpty() || $products->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Missing required data. Ensure SupplierSeeder, ProductSeeder, RoleSeeder, and user data are seeded first.');
            return;
        }

        // Create sample collections for the past 3 months
        $collectionData = [
            // Green Valley Farms - Coconuts
            [
                'supplier' => 'Green Valley Farms',
                'product' => 'Coconuts',
                'collections' => [
                    ['date' => '2025-10-15', 'quantity' => 150.500, 'unit' => 'kg'],
                    ['date' => '2025-11-10', 'quantity' => 200.750, 'unit' => 'kg'],
                    ['date' => '2025-12-05', 'quantity' => 180.250, 'unit' => 'kg'],
                ],
            ],
            // Mountain Fresh Produce - Coffee Beans
            [
                'supplier' => 'Mountain Fresh Produce',
                'product' => 'Coffee Beans',
                'collections' => [
                    ['date' => '2025-10-20', 'quantity' => 50.000, 'unit' => 'kg'],
                    ['date' => '2025-11-15', 'quantity' => 75.500, 'unit' => 'kg'],
                    ['date' => '2025-12-10', 'quantity' => 60.250, 'unit' => 'kg'],
                ],
            ],
            // Coastal Growers Co. - Tea Leaves
            [
                'supplier' => 'Coastal Growers Co.',
                'product' => 'Tea Leaves',
                'collections' => [
                    ['date' => '2025-10-25', 'quantity' => 300.000, 'unit' => 'kg'],
                    ['date' => '2025-11-20', 'quantity' => 350.750, 'unit' => 'kg'],
                    ['date' => '2025-12-15', 'quantity' => 325.500, 'unit' => 'kg'],
                ],
            ],
            // Sunrise Agriculture - Latex
            [
                'supplier' => 'Sunrise Agriculture',
                'product' => 'Latex',
                'collections' => [
                    ['date' => '2025-10-12', 'quantity' => 80.000, 'unit' => 'kg'],
                    ['date' => '2025-11-08', 'quantity' => 95.250, 'unit' => 'kg'],
                    ['date' => '2025-12-03', 'quantity' => 110.500, 'unit' => 'kg'],
                ],
            ],
            // Valley Harvest Inc. - Cocoa Beans
            [
                'supplier' => 'Valley Harvest Inc.',
                'product' => 'Cocoa Beans',
                'collections' => [
                    ['date' => '2025-10-18', 'quantity' => 45.000, 'unit' => 'kg'],
                    ['date' => '2025-11-12', 'quantity' => 55.750, 'unit' => 'kg'],
                    ['date' => '2025-12-08', 'quantity' => 50.250, 'unit' => 'kg'],
                ],
            ],
        ];

        foreach ($collectionData as $data) {
            $supplier = $suppliers->firstWhere('name', $data['supplier']);
            $product = $products->firstWhere('name', $data['product']);

            if (!$supplier || !$product) {
                continue;
            }

            foreach ($data['collections'] as $collectionItem) {
                $collectionDate = Carbon::parse($collectionItem['date']);
                
                // Get the appropriate rate for the collection date
                $rate = Rate::where('product_id', $product->id)
                    ->where('unit', $collectionItem['unit'])
                    ->where('is_active', true)
                    ->whereDate('effective_from', '<=', $collectionDate)
                    ->where(function ($query) use ($collectionDate) {
                        $query->whereNull('effective_to')
                            ->orWhereDate('effective_to', '>=', $collectionDate);
                    })
                    ->orderBy('effective_from', 'desc')
                    ->first();

                if (!$rate) {
                    $this->command->warn("No rate found for {$product->name} on {$collectionDate->toDateString()}");
                    continue;
                }

                $quantity = $collectionItem['quantity'];
                $totalAmount = $quantity * $rate->rate;

                Collection::create([
                    'supplier_id' => $supplier->id,
                    'product_id' => $product->id,
                    'user_id' => $users->random()->id,
                    'rate_id' => $rate->id,
                    'collection_date' => $collectionDate,
                    'quantity' => $quantity,
                    'unit' => $collectionItem['unit'],
                    'rate_applied' => $rate->rate,
                    'total_amount' => $totalAmount,
                    'notes' => "Sample collection for {$supplier->name}",
                    'version' => 1,
                ]);
            }
        }

        $this->command->info('Collections seeded successfully!');
    }
}
