import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  AlertCircle,
} from "lucide-react";
import { addDays, format, startOfWeek, addWeeks, isToday, isBefore, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { doctorService } from "@/services/doctorService";
import { specializationService } from "@/services/specializationService";
import { scheduleService } from "@/services/scheduleService";

import type {
  AppointmentFormData,
  Doctor,
  DoctorDaySlot,
  Specialization,
} from "@/types";
import { cn } from "@/lib/utils";

type AvailabilityDay = {
  date: string;
  slots: DoctorDaySlot[];
  slotsLeft: number;
};

const hhmm = (t: string) => (typeof t === "string" ? t.slice(0, 5) : "");
const buildISODateTime = (date: string, start_time: string) => `${date}T${start_time}`;

interface BookAppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
}

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div key={i} className="flex items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
            i + 1 < currentStep
              ? "bg-teal-500 text-white"
              : i + 1 === currentStep
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
              : "bg-gray-100 text-gray-400"
          )}
        >
          {i + 1 < currentStep ? <Check className="h-4 w-4" /> : i + 1}
        </div>
        {i < totalSteps - 1 && (
          <div
            className={cn(
              "w-12 h-1 mx-1 rounded-full transition-all duration-300",
              i + 1 < currentStep ? "bg-teal-500" : "bg-gray-200"
            )}
          />
        )}
      </div>
    ))}
  </div>
);

// Mini calendar component
const MiniCalendar = ({
  selectedDate,
  onSelectDate,
  availabilityMap,
  weekOffset,
  onWeekChange,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availabilityMap: Map<string, number>;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
}) => {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange(weekOffset - 1)}
          disabled={weekOffset <= 0}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-gray-700">
          {format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange(weekOffset + 1)}
          disabled={weekOffset >= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}

        {/* Date cells */}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const slotsLeft = availabilityMap.get(dateStr) ?? 0;
          const isSelected = selectedDate === dateStr;
          const isPast = isBefore(day, today);
          const hasSlots = slotsLeft > 0;
          const disabled = isPast || !hasSlots;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200",
                isSelected
                  ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-105"
                  : hasSlots && !isPast
                  ? "bg-white hover:bg-teal-50 hover:border-teal-200 border border-gray-200 cursor-pointer"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed",
                isToday(day) && !isSelected && "ring-2 ring-teal-500/30"
              )}
            >
              <span className={cn("text-sm font-semibold", isSelected ? "text-white" : disabled ? "text-gray-300" : "text-gray-700")}>
                {format(day, "d")}
              </span>
              {hasSlots && !isPast && (
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isSelected ? "text-teal-100" : "text-teal-600"
                  )}
                >
                  {slotsLeft} slots
                </span>
              )}
              {isToday(day) && (
                <div className={cn("absolute -top-1 -right-1 w-2 h-2 rounded-full", isSelected ? "bg-white" : "bg-teal-500")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Time slot picker component
const TimeSlotPicker = ({
  slots,
  selectedTime,
  onSelectTime,
  date,
}: {
  slots: DoctorDaySlot[];
  selectedTime: string;
  onSelectTime: (iso: string) => void;
  date: string;
}) => {
  // Group slots by morning/afternoon/evening
  const groupedSlots = useMemo(() => {
    const morning: DoctorDaySlot[] = [];
    const afternoon: DoctorDaySlot[] = [];
    const evening: DoctorDaySlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.start_time.split(":")[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  }, [slots]);

  const renderSlotGroup = (title: string, groupSlots: DoctorDaySlot[], icon: React.ReactNode) => {
    if (groupSlots.length === 0) return null;
    const availableCount = groupSlots.filter((s) => s.is_available).length;
    if (availableCount === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          {icon}
          <span>{title}</span>
          <span className="text-xs text-gray-400">({availableCount} available)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {groupSlots.map((slot, idx) => {
            if (!slot.is_available) return null;
            const iso = buildISODateTime(date, slot.start_time);
            const isSelected = selectedTime === iso;

            return (
              <motion.button
                key={`${date}-${idx}-${slot.start_time}`}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectTime(iso)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isSelected
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50"
                )}
              >
                {hhmm(slot.start_time)}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderSlotGroup("Morning", groupedSlots.morning, <span className="text-amber-500">🌅</span>)}
      {renderSlotGroup("Afternoon", groupedSlots.afternoon, <span className="text-orange-500">☀️</span>)}
      {renderSlotGroup("Evening", groupedSlots.evening, <span className="text-indigo-500">🌙</span>)}
    </div>
  );
};

export const BookAppointmentForm: React.FC<BookAppointmentFormProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AppointmentFormData>({
    doctor_id: 0,
    date_time: "",
    notes: "",
  });
  const [symptoms, setSymptoms] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [weekOffset, setWeekOffset] = useState(0);

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

  const selectedSpec = useMemo(() => {
    return specializations.find((s) => s.id === selectedSpecialization) ?? null;
  }, [specializations, selectedSpecialization]);

  // Next 14 days
  const upcomingDates = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 14 }, (_, i) => format(addDays(base, i), "yyyy-MM-dd"));
  }, []);

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
  const availabilityMap = useMemo(() => {
    const map = new Map<string, number>();
    availabilityDays.forEach((d) => map.set(d.date, d.slotsLeft));
    return map;
  }, [availabilityDays]);

  const selectedDayObj = useMemo(() => {
    return availabilityDays.find((d) => d.date === selectedDay) ?? null;
  }, [availabilityDays, selectedDay]);

  const handleChange = (field: keyof AppointmentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor_id || !formData.date_time) return;
    const finalData = {
      ...formData,
      notes: symptoms ? `Symptoms: ${symptoms}\n\n${formData.notes}` : formData.notes,
    };
    onSubmit(finalData);
  };

  const handleReset = () => {
    setFormData({ doctor_id: 0, date_time: "", notes: "" });
    setSymptoms("");
    setSelectedSpecialization(null);
    setSelectedDay("");
    setStep(1);
    setWeekOffset(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canProceedStep1 = !!selectedSpecialization && formData.doctor_id > 0;
  const canProceedStep2 = !!formData.date_time;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {t("patientFindDoctors.bookAppointmentBtn", "Book Appointment")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <StepIndicator currentStep={step} totalSteps={3} />

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Select Specialization & Doctor */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-3">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Choose Your Doctor</h3>
                    <p className="text-sm text-gray-500 mt-1">Select a specialization and doctor</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Medical Specialization</Label>
                    <Select
                      value={selectedSpecialization?.toString() || ""}
                      onValueChange={(val: string) => {
                        setSelectedSpecialization(Number(val));
                        setFormData((prev) => ({ ...prev, doctor_id: 0, date_time: "" }));
                        setSelectedDay("");
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-teal-500">
                        <SelectValue placeholder="Select a specialization..." />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec.id} value={spec.id.toString()}>
                            {spec.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Doctor</Label>
                    <Select
                      value={formData.doctor_id?.toString() || ""}
                      onValueChange={(val: string) => {
                        handleChange("doctor_id", Number(val));
                        handleChange("date_time", "");
                        setSelectedDay("");
                      }}
                      disabled={!selectedSpecialization}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-teal-500">
                        <SelectValue
                          placeholder={
                            !selectedSpecialization
                              ? "Select a specialization first"
                              : loadingDoctors
                              ? "Loading doctors..."
                              : "Select a doctor..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorsData.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-xs">
                                {doctor.full_name?.charAt(0) || "D"}
                              </div>
                              <div>
                                <div className="font-medium">{doctor.full_name}</div>
                                <div className="text-xs text-gray-500">{doctor.experience_years} years exp.</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Doctor Preview */}
                  {selectedDoctor && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                          {selectedDoctor.full_name?.charAt(0) || "D"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Dr. {selectedDoctor.full_name}</p>
                          <p className="text-sm text-teal-600">{selectedSpec?.title}</p>
                          <p className="text-xs text-gray-500">{selectedDoctor.experience_years} years experience</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      disabled={!canProceedStep1}
                      onClick={() => setStep(2)}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 rounded-xl"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Date & Time */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-3">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Select Date & Time</h3>
                    <p className="text-sm text-gray-500 mt-1">Choose your preferred appointment slot</p>
                  </div>

                  {availabilityQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
                    </div>
                  ) : availabilityQuery.isError ? (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl text-amber-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">Unable to load availability. Please try again.</span>
                    </div>
                  ) : (
                    <>
                      {/* Mini Calendar */}
                      <MiniCalendar
                        selectedDate={selectedDay}
                        onSelectDate={(date) => {
                          setSelectedDay(date);
                          handleChange("date_time", "");
                        }}
                        availabilityMap={availabilityMap}
                        weekOffset={weekOffset}
                        onWeekChange={setWeekOffset}
                      />

                      {/* Time slots */}
                      {selectedDay && selectedDayObj && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                              Available times for{" "}
                              <span className="text-teal-600">{format(new Date(selectedDay), "EEEE, MMM d")}</span>
                            </p>
                          </div>
                          <TimeSlotPicker
                            slots={selectedDayObj.slots}
                            selectedTime={formData.date_time}
                            onSelectTime={(iso) => handleChange("date_time", iso)}
                            date={selectedDay}
                          />
                        </motion.div>
                      )}

                      {/* Selected time display */}
                      {formData.date_time && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                              <Check className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-teal-100">Selected Appointment</p>
                              <p className="text-lg font-semibold">
                                {format(new Date(formData.date_time), "EEEE, MMMM d 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      disabled={!canProceedStep2}
                      onClick={() => setStep(3)}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 rounded-xl"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Additional Information */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-3">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
                    <p className="text-sm text-gray-500 mt-1">Help your doctor prepare for your visit</p>
                  </div>

                  {/* Appointment summary */}
                  <div className="p-4 rounded-xl bg-gray-50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Doctor</p>
                        <p className="font-medium text-gray-900">Dr. {selectedDoctor?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="font-medium text-gray-900">
                          {formData.date_time
                            ? format(new Date(formData.date_time), "EEEE, MMMM d 'at' h:mm a")
                            : "Not selected"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Symptoms or Reason for Visit
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </Label>
                    <Textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="min-h-[100px] rounded-xl border-gray-200 focus:ring-teal-500 resize-none"
                      placeholder="Describe your symptoms or reason for visiting..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Additional Notes
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      className="min-h-[80px] rounded-xl border-gray-200 focus:ring-teal-500 resize-none"
                      placeholder="Any allergies, medications, or other information..."
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="ghost" onClick={() => setStep(2)} className="rounded-xl">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 rounded-xl shadow-lg shadow-teal-500/25"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
