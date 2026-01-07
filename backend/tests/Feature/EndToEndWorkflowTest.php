<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Collection;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * End-to-End Workflow Test
 * Tests complete user journeys through the system
 */
class EndToEndWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create role
        $role = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'Full access',
            'permissions' => ['users.view', 'suppliers.create', 'products.create', 'collections.create', 'payments.create'],
        ]);

        // Create and authenticate user
        $this->user = User::factory()->create(['role_id' => $role->id]);
        $this->token = auth('api')->login($this->user);
    }

    /**
     * Test complete supplier lifecycle workflow
     */
    public function test_complete_supplier_lifecycle()
    {
        // 1. Create supplier
        $supplierResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/suppliers', [
            'name' => 'John Doe',
            'code' => 'SUP001',
            'contact_number' => '1234567890',
            'address' => '123 Main St',
        ]);

        $supplierResponse->assertStatus(201);
        $supplierId = $supplierResponse->json('data.id');

        // 2. Create product
        $productResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/products', [
            'name' => 'Tea Leaves',
            'code' => 'PROD001',
            'description' => 'Premium tea leaves',
            'base_unit' => 'kg',
            'supported_units' => ['kg', 'g'],
        ]);

        $productResponse->assertStatus(201);
        $productId = $productResponse->json('data.id');

        // 3. Create rate
        $rateResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/rates', [
            'product_id' => $productId,
            'rate' => 250.00,
            'unit' => 'kg',
            'effective_from' => now()->toDateString(),
        ]);

        $rateResponse->assertStatus(201);

        // 4. Record collection (50.5 kg × 250 = 12,625)
        $collectionResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/collections', [
            'supplier_id' => $supplierId,
            'product_id' => $productId,
            'quantity' => 50.5,
            'unit' => 'kg',
            'collection_date' => now()->toDateString(),
        ]);

        $collectionResponse->assertStatus(201);
        $collectionResponse->assertJson([
            'data' => [
                'total_amount' => 12625.0,
            ],
        ]);

        // 5. Record advance payment
        $advanceResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/payments', [
            'supplier_id' => $supplierId,
            'amount' => 5000.00,
            'payment_type' => 'advance',
            'payment_date' => now()->toDateString(),
        ]);

        $advanceResponse->assertStatus(201);

        // 6. Check supplier balance (12,625 - 5,000 = 7,625)
        $balanceResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/suppliers/{$supplierId}/balance");

        $balanceResponse->assertStatus(200);
        $balanceResponse->assertJson([
            'balance' => 7625.0,
        ]);

        // 7. Record partial payment
        $partialResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/payments', [
            'supplier_id' => $supplierId,
            'amount' => 3000.00,
            'payment_type' => 'partial',
            'payment_date' => now()->toDateString(),
        ]);

        $partialResponse->assertStatus(201);

        // 8. Check final balance (7,625 - 3,000 = 4,625)
        $finalBalanceResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/suppliers/{$supplierId}/balance");

        $finalBalanceResponse->assertStatus(200);
        $finalBalanceResponse->assertJson([
            'balance' => 4625.0,
        ]);

        // 9. Verify audit trail exists
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->user->id,
            'action' => 'create',
            'model_type' => 'App\Models\Supplier',
        ]);
    }

    /**
     * Test multi-product collection workflow
     */
    public function test_multi_product_collection_workflow()
    {
        // Create supplier
        $supplier = Supplier::factory()->create();

        // Create two products with rates
        $product1 = Product::factory()->create(['name' => 'Product A', 'code' => 'PA001']);
        $product2 = Product::factory()->create(['name' => 'Product B', 'code' => 'PB001']);

        Rate::create([
            'product_id' => $product1->id,
            'rate' => 100.00,
            'unit' => 'kg',
            'effective_from' => now()->toDateString(),
        ]);

        Rate::create([
            'product_id' => $product2->id,
            'rate' => 150.00,
            'unit' => 'kg',
            'effective_from' => now()->toDateString(),
        ]);

        // Record collections for both products
        $collection1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/collections', [
            'supplier_id' => $supplier->id,
            'product_id' => $product1->id,
            'quantity' => 10.0,
            'unit' => 'kg',
            'collection_date' => now()->toDateString(),
        ]);

        $collection2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/collections', [
            'supplier_id' => $supplier->id,
            'product_id' => $product2->id,
            'quantity' => 5.0,
            'unit' => 'kg',
            'collection_date' => now()->toDateString(),
        ]);

        $collection1->assertStatus(201);
        $collection2->assertStatus(201);

        // Check balance (10×100 + 5×150 = 1,750)
        $balance = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/suppliers/{$supplier->id}/balance");

        $balance->assertJson([
            'balance' => 1750.0,
        ]);
    }

    /**
     * Test report generation workflow
     */
    public function test_report_generation_workflow()
    {
        // Create test data
        $supplier1 = Supplier::factory()->create();
        $supplier2 = Supplier::factory()->create();
        $product = Product::factory()->create();
        
        Rate::create([
            'product_id' => $product->id,
            'rate' => 200.00,
            'unit' => 'kg',
            'effective_from' => now()->toDateString(),
        ]);

        // Create collections
        Collection::create([
            'supplier_id' => $supplier1->id,
            'product_id' => $product->id,
            'user_id' => $this->user->id,
            'quantity' => 10.0,
            'unit' => 'kg',
            'rate_id' => 1,
            'rate_applied' => 200.0,
            'total_amount' => 2000.0,
            'collection_date' => now()->toDateString(),
            'version' => 1,
        ]);

        Collection::create([
            'supplier_id' => $supplier2->id,
            'product_id' => $product->id,
            'user_id' => $this->user->id,
            'quantity' => 15.0,
            'unit' => 'kg',
            'rate_id' => 1,
            'rate_applied' => 200.0,
            'total_amount' => 3000.0,
            'collection_date' => now()->toDateString(),
            'version' => 1,
        ]);

        // Create payments
        Payment::create([
            'supplier_id' => $supplier1->id,
            'amount' => 1000.0,
            'payment_type' => 'partial',
            'payment_date' => now()->toDateString(),
            'version' => 1,
        ]);

        // Test system summary report
        $summary = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/reports/summary');

        $summary->assertStatus(200);
        $summary->assertJsonStructure([
            'totalSuppliers',
            'totalProducts',
            'totalCollections',
            'totalCollectionAmount',
            'totalPayments',
            'totalPaymentAmount',
            'outstandingBalance',
        ]);

        // Test supplier balances report
        $supplierBalances = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/reports/supplier-balances');

        $supplierBalances->assertStatus(200);
        $this->assertIsArray($supplierBalances->json());

        // Test collections summary
        $collectionsSummary = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/reports/collections-summary');

        $collectionsSummary->assertStatus(200);
    }

    /**
     * Test version conflict detection in workflow
     */
    public function test_version_conflict_in_workflow()
    {
        $supplier = Supplier::factory()->create(['version' => 1]);

        // Device 1 updates supplier
        $update1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Updated Name 1',
            'code' => $supplier->code,
            'version' => 1,
        ]);

        $update1->assertStatus(200);

        // Device 2 tries to update with old version (should fail)
        $update2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Updated Name 2',
            'code' => $supplier->code,
            'version' => 1, // Old version
        ]);

        $update2->assertStatus(409); // Conflict
        $update2->assertJson([
            'conflict' => true,
        ]);
    }

    /**
     * Test authentication flow
     */
    public function test_authentication_workflow()
    {
        // 1. Register new user
        $registerResponse = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $registerResponse->assertStatus(201);
        $registerResponse->assertJsonStructure([
            'success',
            'data' => [
                'user',
                'token',
                'token_type',
                'expires_in',
            ],
        ]);

        $token = $registerResponse->json('data.token');

        // 2. Access protected route
        $meResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/me');

        $meResponse->assertStatus(200);
        $meResponse->assertJson([
            'success' => true,
        ]);

        // 3. Logout
        $logoutResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $logoutResponse->assertStatus(200);

        // 4. Try to access protected route with same token (should fail)
        $unauthorizedResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/me');

        $unauthorizedResponse->assertStatus(401);
    }
}
