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
        
        // Configure authentication to return JSON for API requests instead of redirecting
        // This prevents "Route [login] not defined" errors for JWT-based API authentication
        \Illuminate\Auth\Middleware\Authenticate::redirectUsing(function ($request) {
            // For API requests, return null to trigger JSON response via exception handler
            // For web requests, would redirect to login (but not implemented in this API-only app)
            if ($request->expectsJson() || $request->is('api/*')) {
                return null;
            }
            // Fallback for any potential web routes (though this is an API-only application)
            return url('/api/login');
        });
    }
}
