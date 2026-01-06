import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { doctorService } from "@/services/doctorService";
import { specializationService } from "@/services/specializationService";
import { scheduleService } from "@/services/scheduleService";

import type {
    AppointmentFormData,
    Doctor,
    DoctorDaySlot,
    Specialization,
} from "@/types";

type AvailabilityDay = {
    date: string;      // "YYYY-MM-DD"
    slots: DoctorDaySlot[];
    slotsLeft: number; // count of is_available
};

const hhmm = (t: string) => (typeof t === "string" ? t.slice(0, 5) : "");
const buildISODateTime = (date: string, start_time: string) => `${date}T${start_time}`; // -> "YYYY-MM-DDT07:31:11.451Z"

interface BookAppointmentFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: AppointmentFormData) => void;
}

export const BookAppointmentForm: React.FC<BookAppointmentFormProps> = ({
                                                                            open,
                                                                            onClose,
                                                                            onSubmit,
                                                                        }) => {
    const [formData, setFormData] = useState<AppointmentFormData>({
        doctor_id: 0,
        date_time: "",
        notes: "",
    });
    const [symptoms, setSymptoms] = useState("");

    const [selectedSpecialization, setSelectedSpecialization] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>("");

    const { data: specializations = [] } = useQuery<Specialization[]>({
        queryKey: ["specializations"],
        queryFn: () => specializationService.getSpecializations(),
    });

    const { data: doctorsData = [], isLoading: loadingDoctors } = useQuery<Doctor[]>({
        queryKey: ["doctors", selectedSpecialization],
        queryFn: () =>
            doctorService.getDoctors(0, 50, {
                specialization_id: selectedSpecialization || undefined,
                status: "approved",
            }),
        enabled: !!selectedSpecialization,
    });

    const selectedDoctor = useMemo(() => {
        return doctorsData.find((d) => d.id === formData.doctor_id) ?? null;
    }, [doctorsData, formData.doctor_id]);

    // next 14 days list
    const upcomingDates = useMemo(() => {
        const base = new Date();
        return Array.from({ length: 14 }, (_, i) => format(addDays(base, i), "yyyy-MM-dd"));
    }, []);

    // Fetch availability for all upcoming dates (doctor + each day)
    const availabilityQuery = useQuery<AvailabilityDay[]>({
        queryKey: ["doctorAvailabilityDays", formData.doctor_id, upcomingDates],
        enabled: formData.doctor_id > 0,
        queryFn: async () => {
            const results = await Promise.all(
                upcomingDates.map(async (date) => {
                    const slots = await scheduleService.getAvailableSlots(formData.doctor_id, date);
                    const slotsLeft = slots.filter((s) => s.is_available).length;
                    return { date, slots, slotsLeft };
                })
            );
            return results;
        },
    });

    const availabilityDays = availabilityQuery.data ?? [];

    const selectedDayObj = useMemo(() => {
        return availabilityDays.find((d) => d.date === selectedDay) ?? null;
    }, [availabilityDays, selectedDay]);

    const handleChange = (field: keyof AppointmentFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.doctor_id || !formData.date_time) {
            alert("Please select a doctor and appointment time");
            return;
        }
        onSubmit(formData);
    };

    const handleReset = () => {
        setFormData({ doctor_id: 0, date_time: "", notes: "" });
        setSymptoms("");
        setSelectedSpecialization(null);
        setSelectedDay("");
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) handleClose();
            }}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Medical Specialization *</Label>
                        <select
                            id="specialization"
                            value={selectedSpecialization || ""}
                            onChange={(e) => {
                                setSelectedSpecialization(Number(e.target.value));
                                setFormData((prev) => ({ ...prev, doctor_id: 0, date_time: "" }));
                                setSelectedDay("");
                            }}
                            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                            required
                        >
                            <option value="">Select a specialization...</option>
                            {specializations.map((spec) => (
                                <option key={spec.id} value={spec.id}>
                                    {spec.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="doctor">Doctor *</Label>
                        <select
                            id="doctor"
                            value={formData.doctor_id || ""}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                handleChange("doctor_id", id);
                                handleChange("date_time", "");
                                setSelectedDay("");
                            }}
                            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                            required
                            disabled={!selectedSpecialization}
                        >
                            <option value="">
                                {!selectedSpecialization
                                    ? "Select a specialization first"
                                    : loadingDoctors
                                        ? "Loading doctors..."
                                        : "Select a doctor..."}
                            </option>
                            {doctorsData.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.full_name} ({doctor.experience_years} years exp.)
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.doctor_id > 0 && (
                        <div className="space-y-2">
                            <Label>Doctor Availability (next 14 days)</Label>

                            {availabilityQuery.isLoading ? (
                                <p className="text-sm text-muted-foreground">Loading availability...</p>
                            ) : availabilityQuery.isError ? (
                                <p className="text-sm text-destructive">
                                    Failed to load availability. You can still choose date/time manually.
                                </p>
                            ) : availabilityDays.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No availability returned for this doctor.</p>
                            ) : (
                                <>
                                    {/* Days */}
                                    <div className="flex flex-wrap gap-2">
                                        {availabilityDays.map((day) => {
                                            const disabled = day.slotsLeft <= 0;
                                            return (
                                                <Button
                                                    key={day.date}
                                                    type="button"
                                                    variant={selectedDay === day.date ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={disabled}
                                                    onClick={() => {
                                                        setSelectedDay(day.date);
                                                        handleChange("date_time", "");
                                                    }}
                                                >
                                                    {format(new Date(day.date), "EEE dd")}
                                                    <span className="ml-2 text-xs opacity-80">({day.slotsLeft} left)</span>
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {/* Slots */}
                                    {selectedDayObj && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">
                                                {selectedDoctor ? `Dr. ${selectedDoctor.full_name}` : "Doctor"} — choose a time:
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {selectedDayObj.slots.map((slot, idx) => {
                                                    const left = slot.is_available ? 1 : 0;
                                                    const disabled = !slot.is_available;

                                                    const iso = buildISODateTime(selectedDayObj.date, slot.start_time);
                                                    const active = formData.date_time === iso;

                                                    return (
                                                        <Button
                                                            key={`${selectedDayObj.date}-${idx}-${slot.start_time}`}
                                                            type="button"
                                                            variant={active ? "default" : "outline"}
                                                            size="sm"
                                                            disabled={disabled}
                                                            onClick={() => handleChange("date_time", iso)}
                                                        >
                                                            {hhmm(slot.start_time)} - {hhmm(slot.end_time)}
                                                            <span className="ml-2 text-xs opacity-80">({left} left)</span>
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            <div className="relative">
                                                <Input value={formData.date_time} readOnly />
                                                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Fallback manual Date/Time */}
                    {formData.doctor_id > 0 && availabilityQuery.isError && (
                        <div className="space-y-2">
                            <Label htmlFor="date_time">Appointment Date & Time *</Label>
                            <div className="relative">
                                <Input
                                    id="date_time"
                                    type="datetime-local"
                                    value={formData.date_time}
                                    onChange={(e) => handleChange("date_time", e.target.value)}
                                    min={getMinDateTime()}
                                    required
                                    className="pl-3"
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Symptoms (stored in notes) */}
                    <div className="space-y-2">
                        <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                        <textarea
                            id="symptoms"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="Describe your symptoms..."
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="Any additional information..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!formData.date_time}>
                            Book Appointment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
