// Admin Login Page
// Secure authentication with email and password

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, resetAdminPassword } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMode, setResetMode] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: 'Validation Error',
                description: 'Please enter both email and password',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            await loginAdmin(email, password);
            toast({
                title: 'Login Successful',
                description: 'Welcome to the admin panel',
            });
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);

            let errorMessage = 'Failed to login. Please check your credentials.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.message.includes('Unauthorized')) {
                errorMessage = 'You do not have admin privileges';
            }

            toast({
                title: 'Login Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: 'Validation Error',
                description: 'Please enter your email address',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            await resetAdminPassword(email);
            toast({
                title: 'Password Reset Email Sent',
                description: 'Check your email for password reset instructions',
            });
            setResetMode(false);
        } catch (error: any) {
            console.error('Password reset error:', error);
            toast({
                title: 'Password Reset Failed',
                description: 'Failed to send password reset email. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Teemaster Admin</h1>
                    <p className="text-gray-300">Secure Admin Panel</p>
                </div>

                <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">
                            {resetMode ? 'Reset Password' : 'Admin Login'}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            {resetMode
                                ? 'Enter your email to receive password reset instructions'
                                : 'Enter your credentials to access the admin panel'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={resetMode ? handlePasswordReset : handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-200">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {!resetMode && (
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-200">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {resetMode ? 'Sending...' : 'Logging in...'}
                                    </>
                                ) : (
                                    <>{resetMode ? 'Send Reset Link' : 'Login'}</>
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setResetMode(!resetMode)}
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                    disabled={loading}
                                >
                                    {resetMode ? 'Back to Login' : 'Forgot Password?'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="mt-6 text-center text-sm text-gray-400">
                    <p>🔒 This is a secure admin area</p>
                    <p className="mt-1">Only authorized personnel can access this panel</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
