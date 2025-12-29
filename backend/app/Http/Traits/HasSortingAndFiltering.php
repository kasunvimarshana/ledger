<?php

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Trait HasSortingAndFiltering
 * 
 * Provides reusable sorting and filtering functionality for API controllers
 * following DRY principles and maintaining consistent behavior across endpoints.
 */
trait HasSortingAndFiltering
{
    /**
     * Apply sorting to a query based on request parameters
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param array $allowedFields List of fields that can be sorted
     * @param string $defaultField Default field to sort by
     * @param string $defaultOrder Default sort order (asc|desc)
     * @return Builder
     */
    protected function applySorting(
        Builder $query,
        Request $request,
        array $allowedFields,
        string $defaultField = 'created_at',
        string $defaultOrder = 'desc'
    ): Builder {
        $sortBy = $request->get('sort_by', $defaultField);
        $sortOrder = $request->get('sort_order', $defaultOrder);
        
        // Validate sort field and order
        if (in_array($sortBy, $allowedFields) && in_array($sortOrder, ['asc', 'desc'])) {
            return $query->orderBy($sortBy, $sortOrder);
        }
        
        // Fallback to default sorting
        return $query->orderBy($defaultField, $defaultOrder);
    }
    
    /**
     * Apply search filtering to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param array $searchableFields List of fields to search in
     * @param string $searchParam The request parameter name for search (default: 'search')
     * @return Builder
     */
    protected function applySearch(
        Builder $query,
        Request $request,
        array $searchableFields,
        string $searchParam = 'search'
    ): Builder {
        if (!$request->has($searchParam) || empty($searchableFields)) {
            return $query;
        }
        
        $search = $request->get($searchParam);
        
        return $query->where(function($q) use ($search, $searchableFields) {
            foreach ($searchableFields as $index => $field) {
                if ($index === 0) {
                    $q->where($field, 'like', "%{$search}%");
                } else {
                    $q->orWhere($field, 'like', "%{$search}%");
                }
            }
        });
    }
    
    /**
     * Apply pagination to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param int $defaultPerPage Default number of results per page
     * @param int $maxPerPage Maximum allowed results per page
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    protected function applyPagination(
        Builder $query,
        Request $request,
        int $defaultPerPage = 15,
        int $maxPerPage = 100
    ) {
        $perPage = $request->get('per_page', $defaultPerPage);
        
        // Ensure per_page doesn't exceed maximum
        $perPage = min($perPage, $maxPerPage);
        
        return $query->paginate($perPage);
    }
    
    /**
     * Apply date range filtering to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param string $dateField The database field to filter on
     * @param string $startDateParam Request parameter for start date
     * @param string $endDateParam Request parameter for end date
     * @return Builder
     */
    protected function applyDateFilter(
        Builder $query,
        Request $request,
        string $dateField,
        string $startDateParam = 'start_date',
        string $endDateParam = 'end_date'
    ): Builder {
        if ($request->has($startDateParam)) {
            $query->where($dateField, '>=', $request->get($startDateParam));
        }
        
        if ($request->has($endDateParam)) {
            $query->where($dateField, '<=', $request->get($endDateParam));
        }
        
        return $query;
    }
    
    /**
     * Apply boolean filter to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param string $field The database field to filter on
     * @param string $param The request parameter name
     * @return Builder
     */
    protected function applyBooleanFilter(
        Builder $query,
        Request $request,
        string $field,
        string $param
    ): Builder {
        if ($request->has($param)) {
            $query->where($field, $request->get($param));
        }
        
        return $query;
    }
}
