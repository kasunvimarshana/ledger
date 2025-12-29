<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for version tracking
        \App\Models\Supplier::observe(\App\Observers\SupplierObserver::class);
        
        // Configure authentication to return JSON for API requests
        \Illuminate\Auth\Middleware\Authenticate::redirectUsing(function ($request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return null;
            }
            return route('login');
        });
    }
}
