import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  Users as UsersIcon,
  FileText,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Activity,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { emrService } from '@/services/emrService';
import type { Appointment, EMR } from '@/types';
import { cn } from '@/lib/utils';

interface PatientInfo {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
  appointments: Appointment[];
}

export const DoctorPatients: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch ALL doctor's appointments (no date filter)
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['doctorPatients', 'all'],
    enabled: !!user,
    queryFn: () => bookingService.getMyDoctorBookings(), // No date = all appointments
  });

  // Build unique patients list from all appointments
  const uniquePatients = useMemo(() => {
    const patientMap = new Map<number, PatientInfo>();

    appointments.forEach((appointment) => {
      if (!appointment.patient_id) return;

      const patientId = appointment.patient_id;
      const visitDate = appointment.date_time;

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: patientId,
          full_name: appointment.patient_name || 'Unknown',
          email: appointment.patient_email || '',
          phone: appointment.patient_phone || '',
          lastVisit: visitDate,
          totalVisits: 1,
          appointments: [appointment],
        });
      } else {
        const existing = patientMap.get(patientId)!;
        existing.totalVisits += 1;
        existing.appointments.push(appointment);
        if (new Date(visitDate) > new Date(existing.lastVisit)) {
          existing.lastVisit = visitDate;
        }
      }
    });

    // Sort by most recent visit
    return Array.from(patientMap.values()).sort(
      (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
  }, [appointments]);

  // Filter by search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return uniquePatients;
    const term = searchTerm.toLowerCase();
    return uniquePatients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.phone.includes(term)
    );
  }, [uniquePatients, searchTerm]);

  // Pagination
  const visiblePatients = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredPatients.slice(start, start + rowsPerPage);
  }, [filteredPatients, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

  // Fetch EMRs for selected patient
  const { data: patientEMRs = [] } = useQuery<EMR[]>({
    queryKey: ['patientEMRs', selectedPatient?.id],
    enabled: !!selectedPatient?.id && detailsOpen,
    queryFn: () => emrService.getPatientEMRs(selectedPatient!.id),
  });

  const handleViewPatient = (patient: PatientInfo) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
      case 'no_show':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <UsersIcon className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.error')}</h3>
        <p className="text-muted-foreground">{t('doctorPatients.failedToLoad')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {t('doctorPatients.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('doctorPatients.subtitle', { count: uniquePatients.length })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <UsersIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{uniquePatients.length}</p>
                  <p className="text-xs text-emerald-600">{t('doctorPatients.totalPatients')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{appointments.length}</p>
                  <p className="text-xs text-blue-600">{t('doctorPatients.totalAppointments')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('doctorPatients.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          className="pl-9 bg-white"
        />
      </div>

      {/* Patients Grid */}
      {visiblePatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visiblePatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="group cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden"
                onClick={() => handleViewPatient(patient)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-emerald-100 group-hover:ring-emerald-300 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-medium">
                        {getInitials(patient.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                        {patient.full_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{patient.email || 'N/A'}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 rounded">
                        <Activity className="h-3 w-3 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.totalVisits}</p>
                        <p className="text-xs text-muted-foreground">{t('doctorPatients.visits')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <Clock className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(patient.lastVisit), 'MMM dd')}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('doctorPatients.lastVisit')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <UsersIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('doctorPatients.noPatientsFound')}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? t('doctorPatients.noSearchResults')
                : t('doctorPatients.noAppointmentsYet')}
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {filteredPatients.length > rowsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('common.showingRange', {
              from: page * rowsPerPage + 1,
              to: Math.min((page + 1) * rowsPerPage, filteredPatients.length),
              total: filteredPatients.length,
            })}{' '}
            {t('doctorPatients.patients')}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              {t('common.previous')}
            </Button>
            <span className="text-sm px-3">
              {t('common.pageOf', { page: page + 1, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  {selectedPatient && getInitials(selectedPatient.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedPatient?.full_name}</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  {t('doctorPatients.patientDetails')}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="bg-gray-50/50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm text-gray-500 mb-3">
                    {t('doctorPatients.contactInfo')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{selectedPatient.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">{selectedPatient.phone || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment History */}
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('doctorPatients.appointmentHistory')} ({selectedPatient.appointments.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedPatient.appointments
                    .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[50px]">
                            <p className="text-lg font-bold text-emerald-600">
                              {format(new Date(apt.date_time), 'dd')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(apt.date_time), 'MMM yyyy')}
                            </p>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div>
                            <p className="font-medium text-sm">
                              {format(new Date(apt.date_time), 'HH:mm')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {apt.notes || t('doctorPatients.generalConsultation')}
                            </p>
                          </div>
                        </div>
                        <Badge className={cn('text-xs', getStatusColor(apt.status))}>
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              {/* Medical Records */}
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('doctorPatients.medicalRecords')} ({patientEMRs.length})
                </h4>
                {patientEMRs.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {patientEMRs.map((emr) => (
                      <div key={emr.id} className="p-3 bg-white rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{emr.diagnosis || 'No diagnosis'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(emr.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-gray-50 rounded-lg">
                    {t('doctorPatients.noMedicalRecords')}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setDetailsOpen(false)}>{t('common.close')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
