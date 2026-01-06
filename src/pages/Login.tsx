import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Activity} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useAuth} from '../contexts/AuthContext';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const {login} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Login now returns the user object directly
            // The authService handles:
            // 1. POST /users/login -> get tokens
            // 2. GET /users/me -> get user profile
            // 3. Store tokens and user
            const user = await login({email, password});

            // Redirect based on user role
            if (user.is_admin) {
                navigate('/admin/dashboard');
            } else if (user.is_doctor) {
                navigate('/doctor/dashboard');
            } else {
                navigate('/patient/dashboard');
            }
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                'Invalid credentials. Please try again.';

            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                            <Activity className="h-6 w-6 text-primary-foreground"/>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                    <p className="text-muted-foreground">Sign in to your account to continue</p>
                </div>

                {/* Login Card */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Sign in</CardTitle>
                        <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div
                                    className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="h-11"
                                />
                            </div>

                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>

                            {/* Demo credentials */}
                            <div className="pt-4 border-t">
                                <p className="text-xs text-muted-foreground text-center mb-2">Demo accounts:</p>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p className="text-center">Admin: admin@example.com / password</p>
                                    <p className="text-center">Doctor: doctor@example.com / password</p>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    AI-powered healthcare management platform
                </p>
            </div>
        </div>
    );
};
