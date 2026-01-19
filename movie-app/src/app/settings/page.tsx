'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User, Camera, Loader2, ArrowLeft, Save, Lock, Mail } from 'lucide-react';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [name, setName] = React.useState('');
    const [avatar, setAvatar] = React.useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');

    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    React.useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            // Initialize with API URL instead of session image potentially
            // Check if session has a valid image or just a flag
            if (session.user.image && !session.user.image.startsWith('data:') && session.user.image !== 'updated') {
                setAvatar(`/api/user/avatar?t=${Date.now()}`);
            } else {
                // Try to load from API anyway as default
                setAvatar(`/api/user/avatar?t=${Date.now()}`);
            }
        }
    }, [session]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) { // 3MB limit
                setMessage({ type: 'error', text: 'Image size should be less than 3MB' });
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
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    // Check if avatar has changed from session or send explicitly
                    // For now, sending what we have (null or string)
                    // In a perfect world we only send if changed, but simple is okay
                    // However, we should properly handle uploading new images vs keeping existing
                    // The component updates `avatar` state with base64 on file change which is what we want
                    avatar: avatar === session?.user?.image ? undefined : avatar, // Send if different
                    password: currentPassword || undefined, // API expects 'password' for current password
                    newPassword: newPassword || undefined
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update session
            // We do NOT update the session with the full image if it's new
            // We just trigger an update so the client knows something changed
            // The UserMenu component will fetch the new image from /api/user/avatar
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name,
                    // If we uploaded a new avatar, we DON'T put the base64 string here 
                    // to avoid cookie size limits. We can just put a flag or keep the old one
                    // effectively telling the UI "re-render", and our API logic handles the rest.
                    image: avatar?.startsWith('data:') ? 'updated' : avatar
                }
            });

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            // Clear password fields on success
            setCurrentPassword('');
            setNewPassword('');
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return null; // Handle loading/unauth in middleware or parent
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-8 max-w-2xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/profile"
                        className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Feedback Message */}
                    {message && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Profile Photo */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-8 border-b border-white/[0.05]">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-900 ring-2 ring-white/10">
                                {avatar ? (
                                    <Image
                                        src={avatar}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-10 h-10 text-gray-600" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                <Camera className="w-8 h-8 text-white/80" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-white font-medium mb-1">Profile Photo</h3>
                            <p className="text-sm text-gray-500 mb-3">
                                Upload a new photo to customize your profile.
                            </p>
                            <label className="inline-flex py-1.5 px-3 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white rounded cursor-pointer transition-colors">
                                Change Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-white">Personal Information</h2>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
                                <input
                                    type="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-gray-400 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                        <h2 className="text-lg font-medium text-white">Security</h2>
                        <p className="text-sm text-gray-500">
                            Change your password to keep your account secure.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label htmlFor="currentPassword" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="newPassword" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-[#121212] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-white/[0.05] flex justify-end gap-3">
                        <Link
                            href="/profile"
                            className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
