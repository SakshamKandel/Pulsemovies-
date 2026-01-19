'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange?: (page: number) => void;
    onSearch?: (search: string) => void;
    searchPlaceholder?: string;
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
    columns,
    data,
    pagination,
    onPageChange,
    onSearch,
    searchPlaceholder = 'Search...',
    isLoading,
    onRowClick
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');

    const handleSearch = (value: string) => {
        setSearch(value);
        onSearch?.(value);
    };

    return (
        <div className="bg-background-card border border-border rounded-2xl overflow-hidden">
            {/* Search Bar */}
            {onSearch && (
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-4 text-left text-sm font-semibold text-text-secondary"
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && (
                                            <ArrowUpDown className="w-4 h-4 text-text-muted cursor-pointer hover:text-white" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border/50">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4">
                                            <div className="h-4 w-24 bg-border/50 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-text-muted"
                                >
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        'border-b border-border/50 hover:bg-white/5 transition-colors',
                                        onRowClick && 'cursor-pointer'
                                    )}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 text-sm text-text-primary">
                                            {column.render
                                                ? column.render(item)
                                                : String((item as any)[column.key] ?? '-')
                                            }
                                        </td>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-text-muted">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-lg border border-border hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-sm text-text-secondary">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 rounded-lg border border-border hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
