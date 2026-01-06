import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Eye, Calendar, User, Activity, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { emrService } from '../../services/emrService';
import type { EMR } from '../../types';

export const PatientRecords: React.FC = () => {
  const { user } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<EMR | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: records = [], isLoading } = useQuery<EMR[]>({
    queryKey: ['patientRecords', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return emrService.getPatientEMRs(user.id, 0, 100);
    },
    enabled: !!user,
  });

  const handleViewRecord = (record: EMR) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

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
        <h1 className="text-3xl font-bold tracking-tight">My Medical Records</h1>
        <p className="text-muted-foreground mt-1">View your electronic health records and medical history</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {records.filter(r => r.diagnosis).length}
                </p>
                <p className="text-sm text-muted-foreground">Diagnoses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Pill className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {records.filter(r => r.prescription && r.prescription.length > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No Medical Records Yet</h3>
              <p className="text-muted-foreground">
                Your medical records from doctor visits will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {record.diagnosis || 'Medical Record'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {record.doctor_name ? `Dr. ${record.doctor_name}` : 'Doctor'}
                        {record.specialization_name && ` - ${record.specialization_name}`}
                      </p>
                    </div>
                  </div>
                  {record.diagnosis ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Diagnosed</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(record.created_at), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Record ID: #{record.id}</span>
                  </div>
                </div>

                {/* Diagnosis Preview */}
                {record.diagnosis && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Diagnosis:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{record.diagnosis}</p>
                  </div>
                )}

                {/* Prescription Preview */}
                {record.prescription && (
                  <div className="mb-4">
                    <Badge variant="outline">
                      <Pill className="h-3 w-3 mr-1" />
                      Prescription Available
                    </Badge>
                  </div>
                )}

                {/* Notes Preview */}
                {record.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{record.notes}</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewRecord(record)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Record
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Record Detail Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium">{format(new Date(selectedRecord.created_at), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Doctor</p>
                  <p className="font-medium">
                    {selectedRecord.doctor_name ? `Dr. ${selectedRecord.doctor_name}` : 'Doctor'}
                  </p>
                  {selectedRecord.specialization_name && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRecord.specialization_name}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {selectedRecord.diagnosis && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                  <p>{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.prescription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Prescription</p>
                  <div className="p-3 rounded-lg border bg-accent/20">
                    <p className="text-sm whitespace-pre-wrap">{selectedRecord.prescription}</p>
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Doctor's Notes</p>
                  <p className="whitespace-pre-wrap">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
