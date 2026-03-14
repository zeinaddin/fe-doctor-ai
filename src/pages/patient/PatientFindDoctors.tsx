import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  Stethoscope,
  Star,
  Calendar,
  Clock,
  Award,
  Sparkles,
  Heart,
  Shield,
  X,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { doctorService } from '@/services/doctorService.ts';
import { bookingService } from '@/services/bookingService.ts';
import { specializationService } from '@/services/specializationService.ts';
import { scheduleService } from '@/services/scheduleService.ts';
import type { Doctor, Schedule, DoctorDaySlot } from '@/types';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Doctor Card Component
const DoctorCard: React.FC<{
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}> = ({ doctor, onBook, t }) => {
  const initials = doctor.full_name?.split(' ').map(n => n[0]).join('') || 'D';

  // Generate consistent gradient based on doctor name
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
  ];
  const gradientIndex = (doctor.full_name?.charCodeAt(0) || 0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 bg-white">
        {/* Top gradient bar */}
        <div className={cn('h-1.5 bg-gradient-to-r', gradient)} />

        <CardContent className="p-6">
          {/* Header with avatar and basic info */}
          <div className="flex items-start gap-4 mb-5">
            <div className="relative">
              <Avatar className={cn('h-16 w-16 ring-4 ring-white shadow-lg')}>
                <AvatarFallback className={cn('bg-gradient-to-br text-white text-xl font-bold', gradient)}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                Dr. {doctor.full_name || 'Doctor'}
              </h3>
              <Badge className={cn('bg-gradient-to-r text-white border-0 shadow-sm', gradient)}>
                {doctor.specialization_name || 'Specialist'}
              </Badge>

              {/* Rating */}
              {doctor.rating && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.floor(doctor.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{doctor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('patientFindDoctors.experience')}</p>
                <p className="text-sm font-semibold text-gray-900">{doctor.experience_years} {t('common.years')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Award className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('patientFindDoctors.license')}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{doctor.license_number?.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div className="mb-5">
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {doctor.bio}
              </p>
            </div>
          )}

          {/* Verified badge */}
          <div className="flex items-center gap-2 mb-5 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">{t('patientFindDoctors.verifiedProfessional')}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              className={cn('flex-1 h-11 bg-gradient-to-r hover:opacity-90 transition-opacity shadow-lg', gradient)}
              onClick={() => onBook(doctor)}
              disabled={doctor.status !== 'approved'}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t('patientFindDoctors.bookAppointmentBtn')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <Heart className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper functions for date handling
const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const PatientFindDoctors: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');

  // New state for slot selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DoctorDaySlot | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: doctors = [], isLoading } = useQuery<Doctor[]>({
    queryKey: ['doctors', 'available'],
    queryFn: () => doctorService.getDoctors(0, 100, { status: 'approved' }),
  });

  const { data: specializations = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: () => specializationService.getSpecializations(),
  });

  // Fetch doctor's schedules when dialog opens
  const { data: doctorSchedules = [], isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ['doctorSchedules', selectedDoctor?.id],
    queryFn: () => scheduleService.getDoctorSchedules(selectedDoctor!.id),
    enabled: !!selectedDoctor && bookingDialogOpen,
  });

  // Create a set of working days (0-6, where 0 is Monday)
  const workingDays = useMemo(() => {
    return new Set(doctorSchedules.filter(s => s.is_active).map(s => s.day_of_week));
  }, [doctorSchedules]);

  // Fetch available slots when a date is selected
  const { data: availableSlots = [], isLoading: slotsLoading } = useQuery<DoctorDaySlot[]>({
    queryKey: ['availableSlots', selectedDoctor?.id, selectedDate ? formatDateKey(selectedDate) : null],
    queryFn: () => scheduleService.getAvailableSlots(selectedDoctor!.id, formatDateKey(selectedDate!)),
    enabled: !!selectedDoctor && !!selectedDate,
  });

  // Find next available date when no slots for selected date
  const nextAvailableDate = useMemo(() => {
    if (!selectedDate || availableSlots.some(s => s.is_available)) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Search next 60 days for an available date
    for (let i = 1; i <= 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dayOfWeek = (checkDate.getDay() + 6) % 7; // Convert to Monday=0 format

      if (workingDays.has(dayOfWeek)) {
        return checkDate;
      }
    }
    return null;
  }, [selectedDate, availableSlots, workingDays]);

  const bookingMutation = useMutation({
    mutationFn: (bookingData: { date_time: string; doctor_id: number; notes?: string }) =>
      bookingService.createBooking(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      setBookingDialogOpen(false);
      setBookingNotes('');
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      toast.success(t('common.success'), {
        description: t('patientFindDoctors.bookingSuccess'),
      });
    },
    onError: (error) => {
      toast.error(t('common.error'), {
        description: t('patientFindDoctors.bookingFailed'),
      });
      console.error('Booking error:', error);
    },
  });

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    setBookingNotes('');
    setCalendarMonth(new Date());
    setBookingDialogOpen(true);
  };

  const handleSubmitBooking = () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !user) {
      toast.error(t('common.error'), {
        description: t('patientFindDoctors.fillAllFields'),
      });
      return;
    }

    // Combine date and slot start time into ISO datetime
    const dateStr = formatDateKey(selectedDate);
    const timeStr = selectedSlot.start_time.includes('T')
      ? selectedSlot.start_time.split('T')[1].slice(0, 5)
      : selectedSlot.start_time.slice(0, 5);
    const dateTime = `${dateStr}T${timeStr}:00`;

    bookingMutation.mutate({
      date_time: dateTime,
      doctor_id: selectedDoctor.id,
      notes: bookingNotes || undefined,
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: DoctorDaySlot) => {
    if (slot.is_available) {
      setSelectedSlot(slot);
    }
  };

  // Calendar helper function to check if a day is a working day
  const isWorkingDay = (date: Date): boolean => {
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0 format
    return workingDays.has(dayOfWeek);
  };

  // Format slot time for display
  const formatSlotTime = (slot: DoctorDaySlot): string => {
    const startTime = slot.start_time.includes('T')
      ? slot.start_time.split('T')[1].slice(0, 5)
      : slot.start_time.slice(0, 5);
    const endTime = slot.end_time.includes('T')
      ? slot.end_time.split('T')[1].slice(0, 5)
      : slot.end_time.slice(0, 5);
    return `${startTime} - ${endTime}`;
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.bio?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = selectedSpecialty === 'ALL' || doctor.specialization_name === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
          <Stethoscope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-teal-500" />
        </div>
        <p className="text-gray-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* Hero Header */}
      <motion.div variants={cardVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-8 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        {/* Floating elements */}
        <div className="absolute top-4 right-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-4 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium text-white/90">{t('patientFindDoctors.verifiedProfessionals')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('patientFindDoctors.title')}</h1>
          <p className="text-white/80 text-lg max-w-xl">{t('patientFindDoctors.subtitle')}</p>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div variants={cardVariants}>
        <Card className="border-0 shadow-lg shadow-gray-200/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-100">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  placeholder={t('placeholders.searchByName')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-16 pr-4 text-base border-gray-200 focus:border-teal-300 focus:ring-teal-200 rounded-xl"
                />
              </div>

              {/* Specialty Filter */}
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-14 w-full lg:w-64 border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <Stethoscope className="h-4 w-4 text-teal-600" />
                    </div>
                    <SelectValue placeholder={t('patientFindDoctors.allSpecialties')} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('patientFindDoctors.allSpecialties')}</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec.id} value={spec.title}>
                      {spec.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results count and active filters */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {t('patientFindDoctors.foundDoctors', { count: filteredDoctors.length })}
              </p>
              {(searchQuery || selectedSpecialty !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('ALL');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Doctors Grid */}
      <AnimatePresence mode="wait">
        {filteredDoctors.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <Stethoscope className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('patientFindDoctors.noDoctorsFound')}</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchQuery || selectedSpecialty !== 'ALL'
                      ? t('patientFindDoctors.tryAdjustingFilters')
                      : t('patientFindDoctors.noAvailableDoctors')}
                  </p>
                  {(searchQuery || selectedSpecialty !== 'ALL') && (
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSpecialty('ALL');
                      }}
                    >
                      {t('common.clearFilters')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBook={handleBookAppointment}
                t={t}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {selectedDoctor && (
            <>
              {/* Dialog Header with gradient */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white sticky top-0 z-10">
                <DialogTitle className="text-white text-xl mb-4">{t('patientAppointments.bookAppointment')}</DialogTitle>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-4 ring-white/30">
                    <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                      {selectedDoctor.full_name?.split(' ').map(n => n[0]).join('') || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">Dr. {selectedDoctor.full_name}</p>
                    <p className="text-white/80">{selectedDoctor.specialization_name}</p>
                  </div>
                </div>
              </div>

              {/* Dialog Body */}
              <div className="p-6 space-y-5">
                {schedulesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                  </div>
                ) : workingDays.size === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-gray-600">{t('patientFindDoctors.noScheduleAvailable')}</p>
                  </div>
                ) : (
                  <>
                    {/* Calendar Section */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        {t('patientFindDoctors.selectDate')}
                      </Label>
                      <div className="border border-gray-200 rounded-xl p-4">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newMonth = new Date(calendarMonth);
                              newMonth.setMonth(newMonth.getMonth() - 1);
                              setCalendarMonth(newMonth);
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold text-gray-900">
                            {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newMonth = new Date(calendarMonth);
                              newMonth.setMonth(newMonth.getMonth() + 1);
                              setCalendarMonth(newMonth);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const year = calendarMonth.getFullYear();
                            const month = calendarMonth.getMonth();
                            const daysInMonth = getDaysInMonth(year, month);
                            const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7; // Adjust to Monday=0
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const cells = [];
                            // Empty cells before first day
                            for (let i = 0; i < firstDay; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-10" />);
                            }
                            // Day cells
                            for (let day = 1; day <= daysInMonth; day++) {
                              const date = new Date(year, month, day);
                              const isPast = date < today;
                              const isWorking = isWorkingDay(date);
                              const isSelected = selectedDate && formatDateKey(date) === formatDateKey(selectedDate);
                              const isToday = formatDateKey(date) === formatDateKey(today);

                              cells.push(
                                <button
                                  key={day}
                                  disabled={isPast || !isWorking}
                                  onClick={() => handleDateSelect(date)}
                                  className={cn(
                                    'h-10 w-full rounded-lg text-sm font-medium transition-all',
                                    isPast || !isWorking
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'hover:bg-teal-50 cursor-pointer',
                                    isSelected && 'bg-teal-500 text-white hover:bg-teal-600',
                                    isToday && !isSelected && 'ring-2 ring-teal-300',
                                    isWorking && !isPast && !isSelected && 'text-gray-900 bg-teal-50/50'
                                  )}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-teal-50/50 border border-teal-200" />
                            <span>{t('patientFindDoctors.workingDay')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-gray-100" />
                            <span>{t('patientFindDoctors.unavailable')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots Section */}
                    {selectedDate && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          {t('patientFindDoctors.selectTime')} - {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Label>
                        {slotsLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-xl">
                            <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">{t('patientFindDoctors.noSlotsForDate')}</p>
                          </div>
                        ) : !availableSlots.some(s => s.is_available) ? (
                          <div className="text-center py-6 bg-amber-50 rounded-xl border border-amber-100">
                            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-amber-700 text-sm font-medium mb-2">{t('patientFindDoctors.allSlotsBooked')}</p>
                            {nextAvailableDate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDateSelect(nextAvailableDate)}
                                className="text-amber-700 border-amber-300 hover:bg-amber-100"
                              >
                                {t('patientFindDoctors.tryDate')} {nextAvailableDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlots.map((slot, index) => (
                              <button
                                key={index}
                                disabled={!slot.is_available}
                                onClick={() => handleSlotSelect(slot)}
                                className={cn(
                                  'py-3 px-2 rounded-lg text-sm font-medium transition-all border',
                                  slot.is_available
                                    ? selectedSlot === slot
                                      ? 'bg-teal-500 text-white border-teal-500'
                                      : 'bg-white border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700'
                                    : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed line-through'
                                )}
                              >
                                {formatSlotTime(slot).split(' - ')[0]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes Section */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                        {t('patientFindDoctors.notesOptional')}
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder={t('placeholders.anySymptoms')}
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        rows={3}
                        className="border-gray-200 rounded-xl resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={() => setBookingDialogOpen(false)}
                    disabled={bookingMutation.isPending}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    onClick={handleSubmitBooking}
                    disabled={bookingMutation.isPending || !selectedDate || !selectedSlot}
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('patientFindDoctors.booking')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('patientFindDoctors.confirmBooking')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
