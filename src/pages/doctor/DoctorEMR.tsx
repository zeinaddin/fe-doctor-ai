import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Eye,
  FileText,
  Plus,
  Search,
  Stethoscope,
  Pill,
  ClipboardList,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { emrService } from '@/services/emrService';
import { bookingService } from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';

import type { EMR, EMRFormData, Appointment } from '@/types';

function normalizePaginated<T>(raw: unknown): { rows: T[]; total: number } {
  if (Array.isArray(raw)) return { rows: raw, total: raw.length };
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    const typed = raw as { data: T[]; total?: number };
    return { rows: typed.data, total: Number(typed.total ?? typed.data.length) };
  }
  return { rows: [], total: 0 };
}

function parsePrescription(value: unknown): unknown[] | string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }
    return value;
  }
  return value as string;
}

export const DoctorEMR: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // View dialog state
  const [selectedEMR, setSelectedEMR] = useState<EMR | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    patient_id: string;
    appointment_id: string;
    diagnosis: string;
    prescription: string;
    notes: string;
  }>({
    patient_id: '',
    appointment_id: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const skip = page * rowsPerPage;
  const limit = rowsPerPage;

  // Fetch EMRs
  const { data, isLoading, error } = useQuery({
    queryKey: ['doctorEmr', 'me', skip, limit],
    queryFn: () => emrService.getMyEMRs(skip, limit),
  });

  // Fetch all doctor appointments for patient selection
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['doctorAppointments', 'all'],
    enabled: !!user,
    queryFn: () => bookingService.getMyDoctorBookings(),
  });

  // Build unique patients list from appointments
  const uniquePatients = useMemo(() => {
    const patientMap = new Map<number, { id: number; name: string; email: string }>();
    appointments.forEach((apt) => {
      if (apt.patient_id && !patientMap.has(apt.patient_id)) {
        patientMap.set(apt.patient_id, {
          id: apt.patient_id,
          name: apt.patient_name || `Patient #${apt.patient_id}`,
          email: apt.patient_email || '',
        });
      }
    });
    return Array.from(patientMap.values());
  }, [appointments]);

  // Filter appointments by selected patient
  const patientAppointments = useMemo(() => {
    if (!formData.patient_id) return [];
    return appointments.filter(
      (apt) => apt.patient_id === parseInt(formData.patient_id)
    );
  }, [appointments, formData.patient_id]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: EMRFormData) => emrService.createEMR(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorEmr'] });
      setCreateDialogOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      patient_id: '',
      appointment_id: '',
      diagnosis: '',
      prescription: '',
      notes: '',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.patient_id) {
      errors.patient_id = t('doctorEMR.patientRequired');
    }
    if (!formData.diagnosis.trim()) {
      errors.diagnosis = t('doctorEMR.diagnosisRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validateForm() || !user) return;

    const emrData: EMRFormData = {
      patient_id: parseInt(formData.patient_id),
      doctor_id: user.doctor_id || 0,
      diagnosis: formData.diagnosis.trim(),
      prescription: formData.prescription.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      appointment_id: formData.appointment_id
        ? parseInt(formData.appointment_id)
        : undefined,
    };

    createMutation.mutate(emrData);
  };

  const { rows, total } = useMemo(() => normalizePaginated<EMR>(data), [data]);

  // Filter by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (emr) =>
        (emr.patient_name || '').toLowerCase().includes(term) ||
        (emr.diagnosis || '').toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const handleViewEMR = (emr: EMR) => {
    setSelectedEMR(emr);
    setViewDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <FileText className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.error')}</h3>
        <p className="text-muted-foreground">{t('doctorEMR.failedToLoad')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {t('doctorEMR.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('doctorEMR.subtitle')}</p>
        </div>

        <div className="flex gap-3">
          {/* Stats */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{total}</p>
                  <p className="text-xs text-emerald-600">{t('doctorEMR.totalRecords')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 h-auto py-4"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('doctorEMR.createRecord')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('doctorEMR.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Records Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.patient')}</TableHead>
              <TableHead>{t('common.diagnosis')}</TableHead>
              <TableHead>{t('doctorEMR.prescription')}</TableHead>
              <TableHead>{t('common.date')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((emr, index) => (
                <motion.tr
                  key={emr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group hover:bg-emerald-50/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
                          {getInitials(emr.patient_name || 'UN')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {emr.patient_name ?? `Patient #${emr.patient_id ?? '—'}`}
                        </p>
                        {emr.patient_email && (
                          <p className="text-xs text-muted-foreground">{emr.patient_email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {emr.diagnosis ? (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm max-w-[200px] truncate">{emr.diagnosis}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{t('common.pending')}</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {emr.prescription ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Pill className="h-3 w-3 mr-1" />
                        {t('doctorEMR.prescribed')}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {emr.created_at ? format(new Date(emr.created_at), 'MMM dd, yyyy') : '—'}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleViewEMR(emr)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t('common.view')}
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('doctorEMR.noRecordsFound')}</p>
                  <Button
                    variant="link"
                    className="mt-2 text-emerald-600"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('doctorEMR.createFirstRecord')}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {total > rowsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('common.showingRange', {
              from: page * rowsPerPage + 1,
              to: Math.min((page + 1) * rowsPerPage, total),
              total,
            })}{' '}
            {t('doctorEMR.records')}
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

      {/* View EMR Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              {t('doctorEMR.recordDetails')}
            </DialogTitle>
          </DialogHeader>

          {selectedEMR && (
            <div className="space-y-6">
              {/* Patient Info */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-medium">
                        {getInitials(selectedEMR.patient_name || 'UN')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedEMR.patient_name ?? `Patient #${selectedEMR.patient_id ?? '—'}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEMR.patient_email ?? '—'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('doctorEMR.createdOn')}: {format(new Date(selectedEMR.created_at), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnosis */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-emerald-500" />
                  <Label className="text-sm font-medium">{t('common.diagnosis')}</Label>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p>{selectedEMR.diagnosis || t('doctorEMR.noDiagnosis')}</p>
                </div>
              </div>

              {/* Prescription */}
              {(() => {
                const parsed = parsePrescription(selectedEMR.prescription);
                if (!parsed) return null;

                return (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <Label className="text-sm font-medium">{t('doctorEMR.prescription')}</Label>
                    </div>
                    {Array.isArray(parsed) ? (
                      <div className="space-y-2">
                        {(parsed as Record<string, unknown>[]).map((rx, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border bg-blue-50/50 border-blue-200"
                          >
                            <p className="font-medium text-sm">
                              {(rx.medicationName as string) ?? (rx.name as string) ?? `${t('doctorEMR.medication')} #${index + 1}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {rx.dosage ? `${t('doctorEMR.dosage')}: ${rx.dosage}` : null}
                              {rx.frequency ? ` | ${t('doctorEMR.frequency')}: ${rx.frequency}` : null}
                              {rx.duration ? ` | ${t('doctorEMR.duration')}: ${rx.duration}` : null}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                        <p className="whitespace-pre-wrap">{String(parsed)}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Notes */}
              {selectedEMR.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">{t('common.notes')}</Label>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedEMR.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setViewDialogOpen(false)}>{t('common.close')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create EMR Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              {t('doctorEMR.createRecord')}
            </DialogTitle>
            <DialogDescription>
              {t('doctorEMR.createRecordDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('common.patient')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.patient_id}
                onValueChange={(val: string) => {
                  setFormData({ ...formData, patient_id: val, appointment_id: '' });
                  setFormErrors({ ...formErrors, patient_id: '' });
                }}
              >
                <SelectTrigger className={formErrors.patient_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('doctorEMR.selectPatient')} />
                </SelectTrigger>
                <SelectContent>
                  {uniquePatients.map((patient) => (
                    <SelectItem key={patient.id} value={String(patient.id)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {getInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{patient.name}</span>
                        {patient.email && (
                          <span className="text-xs text-muted-foreground">({patient.email})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.patient_id && (
                <p className="text-xs text-red-500">{formErrors.patient_id}</p>
              )}
            </div>

            {/* Appointment Selection (optional) */}
            {patientAppointments.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('doctorEMR.linkToAppointment')}
                </Label>
                <Select
                  value={formData.appointment_id || "none"}
                  onValueChange={(val: string) => setFormData({ ...formData, appointment_id: val === "none" ? "" : val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('doctorEMR.selectAppointment')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('doctorEMR.noAppointment')}
                    </SelectItem>
                    {patientAppointments.map((apt) => (
                      <SelectItem key={apt.id} value={String(apt.id)}>
                        {format(new Date(apt.date_time), 'MMM dd, yyyy HH:mm')} - {apt.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                {t('common.diagnosis')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder={t('doctorEMR.diagnosisPlaceholder')}
                value={formData.diagnosis}
                onChange={(e) => {
                  setFormData({ ...formData, diagnosis: e.target.value });
                  setFormErrors({ ...formErrors, diagnosis: '' });
                }}
                className={formErrors.diagnosis ? 'border-red-500' : ''}
                rows={3}
              />
              {formErrors.diagnosis && (
                <p className="text-xs text-red-500">{formErrors.diagnosis}</p>
              )}
            </div>

            {/* Prescription */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                {t('doctorEMR.prescription')}
              </Label>
              <Textarea
                placeholder={t('doctorEMR.prescriptionPlaceholder')}
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                {t('common.notes')}
              </Label>
              <Textarea
                placeholder={t('doctorEMR.notesPlaceholder')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              onClick={handleCreateSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('doctorEMR.saveRecord')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
