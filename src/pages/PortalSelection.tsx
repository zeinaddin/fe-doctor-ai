import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Shield, Stethoscope, Heart, Activity} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

export const PortalSelection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            <div className="w-full max-w-5xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                            <Activity className="h-8 w-8 text-primary-foreground"/>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">HealthAI Platform</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        AI-powered healthcare management system. Select your portal to continue.
                    </p>
                </div>

                {/* Portal Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Patient Portal */}
                    <Card
                        className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardHeader className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <Heart className="h-8 w-8 text-white"/>
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Patient Portal</CardTitle>
                            <CardDescription className="text-base">
                                Access your health records, book appointments, and consult with our AI assistant
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                                onClick={() => navigate('/patient/login')}
                            >
                                Patient Login
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => navigate('/patient/register')}
                            >
                                Register as Patient
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Doctor Portal */}
                    <Card
                        className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardHeader className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-xl bg-green-600 flex items-center justify-center">
                                    <Stethoscope className="h-8 w-8 text-white"/>
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Doctor Portal</CardTitle>
                            <CardDescription className="text-base">
                                Manage patients, appointments, and electronic medical records
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full h-11 bg-green-600 hover:bg-green-700"
                                onClick={() => navigate('/doctor/login')}
                            >
                                Doctor Login
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-3">
                                For healthcare professionals only
                            </p>
                        </CardContent>
                    </Card>

                    {/* Admin Portal */}
                    <Card
                        className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100">
                        <CardHeader className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-xl bg-red-600 flex items-center justify-center">
                                    <Shield className="h-8 w-8 text-white"/>
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Admin Portal</CardTitle>
                            <CardDescription className="text-base">
                                System administration, user management, and platform configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full h-11 bg-red-600 hover:bg-red-700"
                                onClick={() => navigate('/admin/login')}
                            >
                                Admin Login
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-3">
                                Restricted to administrators
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 pt-8 border-t">
                    <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-primary">AI-Powered</div>
                        <p className="text-sm text-muted-foreground">
                            Advanced AI for symptom analysis and recommendations
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-primary">24/7 Access</div>
                        <p className="text-sm text-muted-foreground">
                            Access your health information anytime, anywhere
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-primary">Secure</div>
                        <p className="text-sm text-muted-foreground">
                            HIPAA-compliant security and data protection
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground pt-4">
                    &copy; 2025 HealthAI. All rights reserved. | AI-powered healthcare management platform
                </p>
            </div>
        </div>
    );
};
