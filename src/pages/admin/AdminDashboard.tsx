import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {Users, Stethoscope, Calendar, CheckCircle, Clock, FileText} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {statsService} from '@/services/statsService.ts';
import type {AdminDashboardStats} from '@/types';

const StatCard = ({title, value, icon: Icon, trend}: { title: string; value: number; icon: any; trend?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </CardContent>
    </Card>
);

export const AdminDashboard: React.FC = () => {
    const {data: stats, isLoading} = useQuery<AdminDashboardStats>({
        queryKey: ['adminStats'],
        queryFn: () => statsService.getAdminStats(),
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of your healthcare management system</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    trend="Active users in system"
                />
                <StatCard
                    title="Total Doctors"
                    value={stats?.totalDoctors || 0}
                    icon={Stethoscope}
                    trend="Available practitioners"
                />
                <StatCard
                    title="Today's Appointments"
                    value={stats?.todayBookings || 0}
                    icon={Calendar}
                    trend="Scheduled for today"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.totalBookings || 0}
                    icon={Calendar}
                    trend="All time appointments"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Pending Bookings"
                    value={stats?.pendingBookings || 0}
                    icon={Clock}
                />
                <StatCard
                    title="Completed"
                    value={stats?.completedBookings || 0}
                    icon={CheckCircle}
                />
                <StatCard
                    title="Medical Records"
                    value={stats?.totalEMRs || 0}
                    icon={FileText}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Use the sidebar navigation to manage users, doctors, appointments, and access the AI symptom
                    checker.
                </CardContent>
            </Card>
        </div>
    );
};
