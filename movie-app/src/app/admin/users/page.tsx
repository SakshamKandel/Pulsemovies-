'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import toast from 'react-hot-toast';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    profileCount: number;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
                ...(search && { search })
            });
            const res = await fetch(`/api/admin/users?${params}`);
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, search]);

    useEffect(() => {
        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [fetchUsers]);

    const handleDelete = async (user: User) => {
        if (!confirm(`Delete user "${user.email}"? This will delete all their profiles, watchlist, and history.`)) return;

        try {
            const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }
            toast.success('User deleted');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const columns = [
        { key: 'email', header: 'Email', sortable: true },
        {
            key: 'name',
            header: 'Name',
            render: (user: User) => user.name || <span className="text-text-muted">-</span>
        },
        {
            key: 'role',
            header: 'Role',
            render: (user: User) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'SUPER_ADMIN' ? 'bg-red-500/20 text-red-400' :
                        user.role === 'ADMIN' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                    }`}>
                    {user.role}
                </span>
            )
        },
        {
            key: 'profileCount',
            header: 'Profiles',
            render: (user: User) => (
                <span className="text-text-secondary">{user.profileCount}</span>
            )
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (user: User) => new Date(user.createdAt).toLocaleDateString()
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (user: User) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${user.id}`); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4 text-text-muted hover:text-white" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4 text-text-muted hover:text-accent-primary" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
                    <p className="text-text-muted">Manage all user accounts</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-xl transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={users}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onSearch={setSearch}
                searchPlaceholder="Search by email or name..."
                isLoading={loading}
            />

            {/* Create/Edit Modal */}
            {(showCreateModal || editingUser) && (
                <UserModal
                    user={editingUser}
                    onClose={() => { setShowCreateModal(false); setEditingUser(null); }}
                    onSuccess={() => { setShowCreateModal(false); setEditingUser(null); fetchUsers(); }}
                />
            )}
        </div>
    );
}

// User Create/Edit Modal
function UserModal({
    user,
    onClose,
    onSuccess
}: {
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        email: user?.email || '',
        name: user?.name || '',
        password: '',
        role: user?.role || 'USER'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: user ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user ? { id: user.id, ...formData } : formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            toast.success(user ? 'User updated' : 'User created');
            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
                <h2 className="text-xl font-bold text-white mb-6">
                    {user ? 'Edit User' : 'Create User'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white focus:outline-none focus:border-accent-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            Password {user && <span className="text-text-muted">(leave blank to keep)</span>}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white focus:outline-none focus:border-accent-primary"
                            {...(!user && { required: true })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white focus:outline-none focus:border-accent-primary"
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-border rounded-xl text-text-secondary hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : user ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
