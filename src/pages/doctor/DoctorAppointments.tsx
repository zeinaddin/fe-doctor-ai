import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    Calendar,
    Clock,
    RefreshCw,
    CheckCircle,
    PlayCircle,
    XCircle,
    UserX,
    Phone,
    ChevronRight,
} from "lucide-react";
import { addDays, format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "../../contexts/AuthContext";
import { bookingService } from "@/services/bookingService";
import type { Appointment, AppointmentStatus } from "@/types";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const UPCOMING_DAYS_TO_CHECK = 14;

export const DoctorAppointments: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // --- Stats query ---
    const { data: stats } = useQuery({
        queryKey: ["doctorAppointmentsStats", selectedDate],
        queryFn: () => bookingService.getMyDoctorAppointmentsStats(selectedDate),
        enabled: !!user,
    });

    // --- Day appointments (using /doctor/me endpoint) ---
    const {
        data: appointments,
        isLoading,
        error,
        refetch: refetchDay,
    } = useQuery<Appointment[]>({
        queryKey: ["doctorAppointmentsMe", selectedDate],
        queryFn: () => bookingService.getMyDoctorBookings(selectedDate),
        refetchInterval: 30000,
        enabled: !!user,
    });

    const sortedAppointments = useMemo(() => {
        if (!appointments) return [];
        return [...appointments].sort(
            (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        );
    }, [appointments]);

    const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
    const dayOfWeek = daysOfWeek[selectedDateObj.getDay()];

    const shouldFetchUpcoming =
        !!user && !isLoading && !error && sortedAppointments.length === 0;

    // Build dates AFTER selectedDate (next 14 days)
    const upcomingDates = useMemo(() => {
        const base = new Date(selectedDate);
        return Array.from({ length: UPCOMING_DAYS_TO_CHECK }, (_, i) =>
            format(addDays(base, i + 1), "yyyy-MM-dd")
        );
    }, [selectedDate]);

    // --- Upcoming fallback ---
    const {
        data: upcomingAppointments = [],
        isLoading: loadingUpcoming,
        isError: errorUpcoming,
        refetch: refetchUpcoming,
    } = useQuery<Appointment[]>({
        queryKey: ["doctorUpcomingFallback", selectedDate],
        enabled: shouldFetchUpcoming,
        queryFn: async () => {
            const perDay = await Promise.all(
                upcomingDates.map(async (d) => {
                    try {
                        return await bookingService.getMyDoctorBookings(d);
                    } catch {
                        return [] as Appointment[];
                    }
                })
            );
            const flat = perDay.flat();
            flat.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
            return flat;
        },
    });

    // Helper to invalidate all appointment queries
    const invalidateAppointmentQueries = () => {
        queryClient.invalidateQueries({ queryKey: ["doctorAppointmentsMe"] });
        queryClient.invalidateQueries({ queryKey: ["doctorAppointmentsStats"] });
        queryClient.invalidateQueries({ queryKey: ["doctorUpcomingFallback"] });
    };

    // --- Status action mutations ---
    const confirmMutation = useMutation({
        mutationFn: bookingService.confirmAppointment,
        onSuccess: () => {
            toast.success(t("common.success"), { description: t("doctorAppointments.confirm") });
            invalidateAppointmentQueries();
        },
        onError: (error: any) => {
            toast.error(t("common.error"), { description: error?.response?.data?.detail || error.message });
        },
    });

    const startMutation = useMutation({
        mutationFn: bookingService.startAppointment,
        onSuccess: () => {
            toast.success(t("common.success"), { description: t("doctorAppointments.startAppointment") });
            invalidateAppointmentQueries();
        },
        onError: (error: any) => {
            toast.error(t("common.error"), { description: error?.response?.data?.detail || error.message });
        },
    });

    const completeMutation = useMutation({
        mutationFn: bookingService.completeAppointment,
        onSuccess: () => {
            toast.success(t("common.success"), { description: t("doctorAppointments.complete") });
            invalidateAppointmentQueries();
        },
        onError: (error: any) => {
            toast.error(t("common.error"), { description: error?.response?.data?.detail || error.message });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: bookingService.cancelBooking,
        onSuccess: () => {
            toast.success(t("common.success"), { description: t("common.cancelled") });
            invalidateAppointmentQueries();
        },
        onError: (error: any) => {
            toast.error(t("common.error"), { description: error?.response?.data?.detail || error.message });
        },
    });

    const noShowMutation = useMutation({
        mutationFn: bookingService.markNoShow,
        onSuccess: () => {
            toast.success(t("common.success"), { description: t("doctorAppointments.markNoShow") });
            invalidateAppointmentQueries();
        },
        onError: (error: any) => {
            toast.error(t("common.error"), { description: error?.response?.data?.detail || error.message });
        },
    });

    const getStatusBadge = (status: string) => {
        const s = (status ?? "").toLowerCase();
        const configs: Record<string, { bg: string; text: string; label: string }> = {
            scheduled: { bg: "bg-amber-100", text: "text-amber-700", label: "Scheduled" },
            confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
            in_progress: { bg: "bg-emerald-100", text: "text-emerald-700", label: "In Progress" },
            completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
            cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
            no_show: { bg: "bg-orange-100", text: "text-orange-700", label: "No Show" },
        };
        const config = configs[s] || { bg: "bg-gray-100", text: "text-gray-700", label: status };
        return (
            <Badge className={cn(config.bg, config.text, "border-0 font-medium")}>
                {config.label}
            </Badge>
        );
    };

    const getAvailableActions = (status: AppointmentStatus) => {
        const s = (status ?? "").toLowerCase();
        const actions: { key: string; label: string; icon: React.ReactNode; color: string; action: (id: number) => void }[] = [];

        if (s === "scheduled") {
            actions.push({
                key: "confirm",
                label: t("doctorAppointments.confirm"),
                icon: <CheckCircle className="h-4 w-4" />,
                color: "text-blue-600",
                action: (id) => confirmMutation.mutate(id),
            });
        }
        if (s === "scheduled" || s === "confirmed") {
            actions.push({
                key: "start",
                label: t("doctorAppointments.startAppointment"),
                icon: <PlayCircle className="h-4 w-4" />,
                color: "text-emerald-600",
                action: (id) => startMutation.mutate(id),
            });
            actions.push({
                key: "noshow",
                label: t("doctorAppointments.markNoShow"),
                icon: <UserX className="h-4 w-4" />,
                color: "text-orange-600",
                action: (id) => noShowMutation.mutate(id),
            });
        }
        if (s === "in_progress" || s === "confirmed") {
            actions.push({
                key: "complete",
                label: t("doctorAppointments.complete"),
                icon: <CheckCircle className="h-4 w-4" />,
                color: "text-emerald-600",
                action: (id) => completeMutation.mutate(id),
            });
        }
        if (s !== "completed" && s !== "cancelled" && s !== "no_show") {
            actions.push({
                key: "cancel",
                label: t("common.cancel"),
                icon: <XCircle className="h-4 w-4" />,
                color: "text-red-600",
                action: (id) => cancelMutation.mutate(id),
            });
        }
        return actions;
    };

    const handleRefresh = async () => {
        await refetchDay();
        if (shouldFetchUpcoming) await refetchUpcoming();
    };

    const renderAppointmentCard = (appointment: Appointment, showDate = false) => {
        const actions = getAvailableActions(appointment.status);
        const isLoading =
            confirmMutation.isPending ||
            startMutation.isPending ||
            completeMutation.isPending ||
            cancelMutation.isPending ||
            noShowMutation.isPending;

        return (
            <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 rounded-xl border bg-white hover:shadow-md transition-all group"
            >
                {/* Time badge */}
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 shrink-0">
                    <Clock className="h-4 w-4 text-emerald-600 mb-1" />
                    <div className="text-sm font-bold text-emerald-700">
                        {format(new Date(appointment.date_time), "HH:mm")}
                    </div>
                    {showDate && (
                        <div className="text-[10px] text-emerald-600">
                            {format(new Date(appointment.date_time), "MMM dd")}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                            {appointment.patient_name || t("common.unknownPatient")}
                        </p>
                        {getStatusBadge(appointment.status)}
                    </div>

                    {appointment.patient_phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appointment.patient_phone}
                        </p>
                    )}

                    {(appointment.symptoms || appointment.notes) && (
                        <div className="mt-2 pt-2 border-t">
                            {appointment.symptoms && (
                                <p className="text-sm">
                                    <span className="font-medium text-gray-700">{t("common.symptoms")}:</span>{" "}
                                    <span className="text-muted-foreground">{appointment.symptoms}</span>
                                </p>
                            )}
                            {appointment.notes && (
                                <p className="text-sm">
                                    <span className="font-medium text-gray-700">{t("common.notes")}:</span>{" "}
                                    <span className="text-muted-foreground">{appointment.notes}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {actions.length > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isLoading}>
                                    {t("common.actions")}
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {actions.map((action, idx) => (
                                    <React.Fragment key={action.key}>
                                        {action.key === "cancel" && idx > 0 && <DropdownMenuSeparator />}
                                        <DropdownMenuItem
                                            className={cn("cursor-pointer", action.color)}
                                            onClick={() => action.action(appointment.id)}
                                        >
                                            {action.icon}
                                            <span className="ml-2">{action.label}</span>
                                        </DropdownMenuItem>
                                    </React.Fragment>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </motion.div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
                    <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {t("doctorAppointments.failedToLoad")}
                </div>
                <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("common.retry")}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {t("doctorAppointments.title")}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t("doctorAppointments.subtitle")}</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("common.refresh")}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left card */}
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>{t("doctorAppointments.selectDate")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">{t("common.date")}</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <Separator />

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("doctorAppointments.selectedDay")}</p>
                            <p className="text-lg font-semibold">{dayOfWeek}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(selectedDateObj, "MMMM dd, yyyy")}
                            </p>
                        </div>

                        <Separator />

                        {/* Stats from API */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-3">{t("doctorAppointments.statistics")}</p>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                    <p className="text-2xl font-bold text-emerald-700">{stats?.total ?? 0}</p>
                                    <p className="text-xs text-emerald-600">{t("common.total")}</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                    <p className="text-2xl font-bold text-blue-700">{stats?.active ?? 0}</p>
                                    <p className="text-xs text-blue-600">{t("common.active")}</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
                                    <p className="text-2xl font-bold text-gray-700">{stats?.done ?? 0}</p>
                                    <p className="text-xs text-gray-600">{t("common.done")}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right card */}
                <Card className="md:col-span-2 bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-emerald-600" />
                            {t("doctorAppointments.appointmentsFor", {
                                date: format(selectedDateObj, "MMMM dd, yyyy"),
                            })}
                        </CardTitle>
                        <CardDescription>{t("doctorAppointments.appointmentsForSelectedDate")}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {sortedAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {sortedAppointments.map((appointment) => renderAppointmentCard(appointment))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 rounded-md border bg-amber-50 border-amber-200">
                                    <p className="font-medium text-amber-800">
                                        {t("doctorAppointments.noAppointmentsForDate")}
                                    </p>
                                    <p className="text-sm text-amber-700">
                                        {t("doctorAppointments.showingUpcoming")}
                                    </p>
                                </div>

                                {loadingUpcoming ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t("doctorAppointments.loadingUpcoming")}
                                    </p>
                                ) : errorUpcoming ? (
                                    <p className="text-sm text-destructive">
                                        {t("doctorAppointments.failedToLoadUpcoming")}
                                    </p>
                                ) : upcomingAppointments.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingAppointments.map((appointment) =>
                                            renderAppointmentCard(appointment, true)
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">{t("doctorAppointments.noUpcomingFound")}</p>
                                        <p className="text-sm mt-1">
                                            {t("doctorAppointments.nothingScheduledDays", {
                                                days: UPCOMING_DAYS_TO_CHECK,
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
