import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, RefreshCw } from "lucide-react";
import { addDays, format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useAuth } from "../../contexts/AuthContext";
import { bookingService } from "@/services/bookingService";
import type { Appointment } from "@/types";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const UPCOMING_DAYS_TO_CHECK = 14;
const ACTIVE_STATUSES = new Set(["confirmed", "scheduled", "in_progress"]);

export const DoctorAppointments: React.FC = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const doctorId = user?.doctor_id || 0;

    // --- Day appointments (selected day) ---
    const {
        data: appointments,
        isLoading,
        error,
        refetch: refetchDay,
    } = useQuery<Appointment[]>({
        queryKey: ["doctorAppointments", doctorId, selectedDate],
        queryFn: () => bookingService.getDoctorBookings(doctorId, selectedDate),
        refetchInterval: 30000,
        enabled: !!doctorId,
    });

    const dayAppointments = useMemo(() => (appointments ? [...appointments] : []), [appointments]);

    const sortedAppointments = useMemo(() => {
        return [...dayAppointments].sort(
            (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        );
    }, [dayAppointments]);

    const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
    const dayOfWeek = daysOfWeek[selectedDateObj.getDay()];

    const shouldFetchUpcoming =
        !!doctorId && !isLoading && !error && sortedAppointments.length === 0;

    // Build dates AFTER selectedDate (next 14 days)
    const upcomingDates = useMemo(() => {
        const base = new Date(selectedDate); // start from selected day
        return Array.from({ length: UPCOMING_DAYS_TO_CHECK }, (_, i) =>
            format(addDays(base, i + 1), "yyyy-MM-dd")
        );
    }, [selectedDate]);

    // --- Upcoming fallback (only when selected day is empty) ---
    const {
        data: upcomingAppointments = [],
        isLoading: loadingUpcoming,
        isError: errorUpcoming,
        refetch: refetchUpcoming,
    } = useQuery<Appointment[]>({
        queryKey: ["doctorUpcomingFallback", doctorId, selectedDate, upcomingDates.join("|")],
        enabled: shouldFetchUpcoming,
        queryFn: async () => {
            const now = new Date();
            const minTime = now; // show future only

            const perDay = await Promise.all(
                upcomingDates.map(async (d) => {
                    try {
                        return await bookingService.getDoctorBookings(doctorId, d);
                    } catch {
                        return [] as Appointment[];
                    }
                })
            );

            const flat = perDay.flat();

            const filtered = flat.filter((a) => {
                const t = new Date(a.date_time);
                const status = (a.status ?? "").toLowerCase();
                return t >= minTime && (ACTIVE_STATUSES.has(status) || status === "");
            });

            filtered.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
            return filtered;
        },
    });

    const getStatusBadgeVariant = (status: string) => {
        switch ((status ?? "").toLowerCase()) {
            case "confirmed":
                return "default";
            case "scheduled":
                return "secondary";
            case "in_progress":
                return "default";
            case "completed":
                return "outline";
            case "cancelled":
                return "destructive";
            case "no_show":
                return "secondary";
            default:
                return "outline";
        }
    };

    const getStatusColor = (status: string) => {
        switch ((status ?? "").toLowerCase()) {
            case "confirmed":
                return "text-green-700";
            case "scheduled":
                return "text-yellow-700";
            case "in_progress":
                return "text-blue-700";
            case "completed":
                return "text-gray-700";
            case "cancelled":
                return "text-red-700";
            case "no_show":
                return "text-orange-700";
            default:
                return "text-gray-700";
        }
    };

    const handleRefresh = async () => {
        await refetchDay();
        if (shouldFetchUpcoming) await refetchUpcoming();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    Failed to load appointments. Please try again later.
                </div>
                <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    const activeCount = sortedAppointments.filter(
        (a) => a.status === "confirmed" || a.status === "scheduled" || a.status === "in_progress"
    ).length;

    const doneCount = sortedAppointments.filter((a) => a.status === "completed").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
                    <p className="text-muted-foreground mt-1">View and manage your daily patient appointments</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left card (unchanged) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Selected Day</p>
                            <p className="text-lg font-semibold">{dayOfWeek}</p>
                            <p className="text-sm text-muted-foreground">{format(selectedDateObj, "MMMM dd, yyyy")}</p>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Statistics</p>
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="default">{sortedAppointments.length} Total</Badge>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{activeCount} Active</Badge>
                                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{doneCount} Done</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right card (old design + fallback upcoming) */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Appointments for {format(selectedDateObj, "MMMM dd, yyyy")}
                        </CardTitle>
                        <CardDescription>Your patient appointments for the selected date</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {sortedAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {sortedAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 shrink-0">
                                            <div className="text-center">
                                                <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                                                <div className="text-xs font-semibold text-primary">
                                                    {format(new Date(appointment.date_time), "HH:mm")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">{appointment.patient_name || "Unknown Patient"}</p>
                                                <Badge
                                                    variant={getStatusBadgeVariant(appointment.status) as any}
                                                    className={getStatusColor(appointment.status)}
                                                >
                                                    {appointment.status.toUpperCase().replace("_", " ")}
                                                </Badge>
                                            </div>

                                            {appointment.patient_email && (
                                                <p className="text-sm text-muted-foreground">{appointment.patient_email}</p>
                                            )}
                                            {appointment.patient_phone && (
                                                <p className="text-sm text-muted-foreground">Phone: {appointment.patient_phone}</p>
                                            )}

                                            {appointment.symptoms && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <p className="text-sm font-medium">Symptoms:</p>
                                                    <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                                                </div>
                                            )}

                                            {appointment.notes && (
                                                <div className="mt-1">
                                                    <p className="text-sm font-medium">Notes:</p>
                                                    <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // ✅ fallback: show upcoming
                            <div className="space-y-4">
                                <div className="p-3 rounded-md border bg-accent/20">
                                    <p className="font-medium">No appointments scheduled for this date.</p>
                                    <p className="text-sm text-muted-foreground">Showing upcoming appointments instead.</p>
                                </div>

                                {loadingUpcoming ? (
                                    <p className="text-sm text-muted-foreground">Loading upcoming appointments...</p>
                                ) : errorUpcoming ? (
                                    <p className="text-sm text-destructive">Failed to load upcoming appointments.</p>
                                ) : upcomingAppointments.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingAppointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 shrink-0">
                                                    <div className="text-center">
                                                        <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                                                        <div className="text-xs font-semibold text-primary">
                                                            {format(new Date(appointment.date_time), "HH:mm")}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-1">
                                                            {format(new Date(appointment.date_time), "MMM dd")}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium">{appointment.patient_name || "Unknown Patient"}</p>
                                                        <Badge
                                                            variant={getStatusBadgeVariant(appointment.status) as any}
                                                            className={getStatusColor(appointment.status)}
                                                        >
                                                            {appointment.status.toUpperCase().replace("_", " ")}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(appointment.date_time), "EEEE, MMMM dd, yyyy")}
                                                    </p>

                                                    {appointment.patient_email && (
                                                        <p className="text-sm text-muted-foreground">{appointment.patient_email}</p>
                                                    )}
                                                    {appointment.patient_phone && (
                                                        <p className="text-sm text-muted-foreground">Phone: {appointment.patient_phone}</p>
                                                    )}

                                                    {appointment.symptoms && (
                                                        <div className="mt-2 pt-2 border-t">
                                                            <p className="text-sm font-medium">Symptoms:</p>
                                                            <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                                                        </div>
                                                    )}

                                                    {appointment.notes && (
                                                        <div className="mt-1">
                                                            <p className="text-sm font-medium">Notes:</p>
                                                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No upcoming appointments found</p>
                                        <p className="text-sm mt-1">Nothing scheduled in the next {UPCOMING_DAYS_TO_CHECK} days.</p>
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
