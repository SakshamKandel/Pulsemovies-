'use client';

import { useState } from 'react';
import Lanyard from '@/components/ui/Lanyard';
import { useProfile, Profile } from '@/context/ProfileContext';
import { Loader2, Plus, Pencil, Trash2, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function ProfileSelection() {
    const { profiles, selectProfile, refreshProfiles, isLoading } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    // Map profiles for Lanyard with colors
    const colors = ['#e50914', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'];
    const lanyardProfiles = profiles.map((p, i) => ({
        ...p,
        color: colors[i % colors.length]
    }));

    const handleSelect = (profileId: string) => {
        if (isEditing) {
            // Edit mode: Open edit modal
            const profile = profiles.find(p => p.id === profileId);
            if (profile) {
                setEditingProfile(profile);
            }
            return;
        }

        // Navigation mode: Select profile
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            selectProfile(profile);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden">
            {/* Lanyard Scene */}
            <div className="absolute inset-0 z-0">
                <Lanyard profiles={lanyardProfiles} onSelect={handleSelect} />
            </div>

            {/* UI Overlay - higher z-index to be above cards */}
            <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-between py-16">
                <div className="text-center pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Who's Watching?</h1>
                    <p className="text-xl text-gray-400 font-light">
                        {isEditing ? "Tap a card to edit" : "Tap or swipe a card to select"}
                    </p>
                </div>

                {/* Buttons with explicit z-index and pointer-events */}
                <div className="pointer-events-auto flex items-center gap-4 relative z-[100]">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-6 py-2.5 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${isEditing
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-gray-300 border-gray-600 hover:border-white hover:text-white'
                            }`}
                    >
                        <Pencil className="w-4 h-4" />
                        {isEditing ? 'Done' : 'Manage Profiles'}
                    </button>

                    {profiles.length < 4 && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-2.5 rounded-full border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-all flex items-center gap-2 bg-black/20 backdrop-blur-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Add Profile Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddProfileModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            setShowAddModal(false);
                            refreshProfiles();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {editingProfile && (
                    <EditProfileModal
                        profile={editingProfile}
                        onClose={() => setEditingProfile(null)}
                        onSuccess={() => {
                            setEditingProfile(null);
                            refreshProfiles();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function AddProfileModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), avatar })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to create profile');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-sm"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Avatar upload */}
                <div className="flex justify-center mb-6">
                    <label className="relative group cursor-pointer">
                        <div className="relative w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <Camera className="w-6 h-6 text-white/30 group-hover:text-white/60 transition-colors" />
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 text-black" />
                        </div>
                    </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Profile Name"
                        className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white text-center text-lg placeholder-white/30 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                        autoFocus
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="flex-1 bg-white text-black font-medium py-2.5 rounded-xl hover:bg-white/90 transition-all disabled:opacity-40"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 text-white/70 font-medium py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function EditProfileModal({ profile, onClose, onSuccess }: { profile: Profile, onClose: () => void, onSuccess: () => void }) {
    const [name, setName] = useState(profile.name);
    const [avatar, setAvatar] = useState<string | null>(profile.avatar || null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/profiles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: profile.id, name: name.trim(), avatar })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/profiles?id=${profile.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to delete profile');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to delete profile');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-sm"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Avatar upload - centered above card */}
                <div className="flex justify-center mb-6">
                    <label className="relative group cursor-pointer">
                        <div className="relative w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <Camera className="w-6 h-6 text-white/30 group-hover:text-white/60 transition-colors" />
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="w-3 h-3 text-black" />
                        </div>
                    </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input - seamless */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Profile Name"
                        className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white text-center text-lg placeholder-white/30 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                        autoFocus
                    />

                    {/* Action Buttons - minimal */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="flex-1 bg-white text-black font-medium py-2.5 rounded-xl hover:bg-white/90 transition-all disabled:opacity-40"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 text-white/70 font-medium py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Delete - subtle */}
                    {!showDeleteConfirm ? (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 text-red-400/60 hover:text-red-400 text-sm py-2 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Profile
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-3 border-t border-white/5"
                        >
                            <p className="text-xs text-center text-white/40 mb-3">
                                Delete this profile permanently?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-500/20 text-red-400 text-sm py-2 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-white/5 text-white/50 text-sm py-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Keep
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </motion.div>
        </div>
    );
}
