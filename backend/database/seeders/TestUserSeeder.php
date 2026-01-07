<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = Role::all()->keyBy('name');

        // Create Admin User
        if ($roles->has('admin')) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@ledger.com',
                'password' => Hash::make('password'),
                'role_id' => $roles['admin']->id,
            ]);
        }

        // Create Manager User
        if ($roles->has('manager')) {
            User::create([
                'name' => 'Manager User',
                'email' => 'manager@ledger.com',
                'password' => Hash::make('password'),
                'role_id' => $roles['manager']->id,
            ]);
        }

        // Create Collector User
        if ($roles->has('collector')) {
            User::create([
                'name' => 'Collector User',
                'email' => 'collector@ledger.com',
                'password' => Hash::make('password'),
                'role_id' => $roles['collector']->id,
            ]);
        }

        // Create Viewer User
        if ($roles->has('viewer')) {
            User::create([
                'name' => 'Viewer User',
                'email' => 'viewer@ledger.com',
                'password' => Hash::make('password'),
                'role_id' => $roles['viewer']->id,
            ]);
        }

        $this->command->info('Test users created successfully!');
    }
}
