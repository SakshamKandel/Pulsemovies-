'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push('/who-is-watching');
                router.refresh();
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 p-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="w-full max-w-[360px] space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                    <p className="text-gray-500 text-sm">Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/5 text-red-500 text-xs font-medium text-center rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="relative">
                                <Mail className="absolute left-0 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    required
                                    className="w-full bg-transparent border-b border-gray-800 py-3 pl-8 text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="relative">
                                <Lock className="absolute left-0 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    className="w-full bg-transparent border-b border-gray-800 py-3 pl-8 pr-8 text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors"
                                />
                                <button
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-2"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold h-12 rounded hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm">
                    New to Pulse?{' '}
                    <Link href="/signup" className="text-white hover:underline">
                        Sign up now
                    </Link>
                </p>
            </div>
        </div>
    );
}
