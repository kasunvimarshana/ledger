<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = Supplier::where('is_active', true)->get();
        $users = User::where('is_active', true)->get();

        if ($suppliers->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Missing required data. Ensure SupplierSeeder and user data are seeded first.');
            return;
        }

        // Create sample payments for the past 3 months
        $paymentData = [
            // Green Valley Farms
            [
                'supplier' => 'Green Valley Farms',
                'payments' => [
                    [
                        'date' => '2025-10-20',
                        'amount' => 3500.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10001',
                    ],
                    [
                        'date' => '2025-11-15',
                        'amount' => 5000.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10002',
                    ],
                    [
                        'date' => '2025-12-10',
                        'amount' => 4500.00,
                        'type' => 'partial',
                        'method' => 'check',
                        'reference' => 'PAY10003',
                    ],
                ],
            ],
            // Mountain Fresh Produce
            [
                'supplier' => 'Mountain Fresh Produce',
                'payments' => [
                    [
                        'date' => '2025-10-25',
                        'amount' => 8500.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10004',
                    ],
                    [
                        'date' => '2025-11-20',
                        'amount' => 12000.00,
                        'type' => 'full',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10005',
                    ],
                ],
            ],
            // Coastal Growers Co.
            [
                'supplier' => 'Coastal Growers Co.',
                'payments' => [
                    [
                        'date' => '2025-10-30',
                        'amount' => 15000.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10006',
                    ],
                    [
                        'date' => '2025-11-25',
                        'amount' => 16000.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10007',
                    ],
                    [
                        'date' => '2025-12-20',
                        'amount' => 14500.00,
                        'type' => 'partial',
                        'method' => 'cash',
                        'reference' => 'PAY10008',
                    ],
                ],
            ],
            // Sunrise Agriculture
            [
                'supplier' => 'Sunrise Agriculture',
                'payments' => [
                    [
                        'date' => '2025-10-15',
                        'amount' => 10000.00,
                        'type' => 'advance',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10009',
                    ],
                    [
                        'date' => '2025-11-10',
                        'amount' => 12500.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10010',
                    ],
                    [
                        'date' => '2025-12-05',
                        'amount' => 15000.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10011',
                    ],
                ],
            ],
            // Valley Harvest Inc.
            [
                'supplier' => 'Valley Harvest Inc.',
                'payments' => [
                    [
                        'date' => '2025-10-22',
                        'amount' => 11000.00,
                        'type' => 'partial',
                        'method' => 'check',
                        'reference' => 'PAY10012',
                    ],
                    [
                        'date' => '2025-11-18',
                        'amount' => 13500.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10013',
                    ],
                    [
                        'date' => '2025-12-12',
                        'amount' => 12000.00,
                        'type' => 'partial',
                        'method' => 'bank_transfer',
                        'reference' => 'PAY10014',
                    ],
                ],
            ],
        ];

        foreach ($paymentData as $data) {
            $supplier = $suppliers->firstWhere('name', $data['supplier']);

            if (!$supplier) {
                continue;
            }

            foreach ($data['payments'] as $paymentItem) {
                Payment::create([
                    'supplier_id' => $supplier->id,
                    'user_id' => $users->random()->id,
                    'payment_date' => Carbon::parse($paymentItem['date']),
                    'amount' => $paymentItem['amount'],
                    'type' => $paymentItem['type'],
                    'reference_number' => $paymentItem['reference'],
                    'payment_method' => $paymentItem['method'],
                    'notes' => "Payment to {$supplier->name}",
                    'version' => 1,
                ]);
            }
        }

        $this->command->info('Payments seeded successfully!');
    }
}
