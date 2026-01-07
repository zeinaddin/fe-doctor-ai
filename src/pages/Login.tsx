import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Activity} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useAuth} from '../contexts/AuthContext';
import {getDefaultPortalPath} from '../types';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const {login} = useAuth();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({email, password});
            // Redirect to user's default portal based on their highest role
            navigate(getDefaultPortalPath(user));
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                t('auth.invalidCredentials');

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
                    <h1 className="text-3xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
                    <p className="text-muted-foreground">{t('auth.signInToContinue')}</p>
                </div>

                {/* Login Card */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">{t('common.signIn')}</CardTitle>
                        <CardDescription>{t('auth.enterCredentials')}</CardDescription>
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
                                <Label htmlFor="email">{t('common.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('placeholders.email')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t('common.password')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t('placeholders.password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="h-11"
                                />
                            </div>

                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                {loading ? t('common.signingIn') : t('common.signIn')}
                            </Button>

                            {/* Register link */}
                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">{t('auth.noAccount')}</span>{' '}
                                <Link to="/register" className="text-primary hover:underline font-medium">
                                    {t('common.signUp')}
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    {t('auth.aiPoweredPlatform')}
                </p>
            </div>
        </div>
    );
};
