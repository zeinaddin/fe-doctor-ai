import React, {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {useTranslation} from "react-i18next";
import {Eye, FileText} from "lucide-react";
import {format} from "date-fns";

import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Separator} from "@/components/ui/separator";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

import {emrService} from "@/services/emrService";
import {doctorService} from "@/services/doctorService";
import {userService} from "@/services/userService";

import type {EMR} from "@/types";

function normalizePaginated<T>(raw: any): { rows: T[]; total: number } {
    if (Array.isArray(raw)) return {rows: raw, total: raw.length};
    if (raw && Array.isArray(raw.data)) return {rows: raw.data, total: Number(raw.total ?? raw.data.length)};
    return {rows: [], total: 0};
}

function parsePrescription(value: any): any[] | string | null {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
            try {
                const parsed = JSON.parse(trimmed);
                return parsed;
            } catch {
                return value;
            }
        }
        return value;
    }
    return value;
}


export const DoctorEMR: React.FC = () => {
    const {t} = useTranslation();
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);

    const [selectedEMR, setSelectedEMR] = useState<EMR | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const skip = page * rowsPerPage;
    const limit = rowsPerPage;

    const {data, isLoading, error} = useQuery({
        queryKey: ["doctorEmr", "me", skip, limit],
        queryFn: () => emrService.getMyEMRs(skip, limit),
    });

    const {rows, total} = useMemo(() => normalizePaginated<EMR>(data), [data]);
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    // Fetch doctor + user ONLY when dialog is open and EMR is selected
    const doctorId = selectedEMR?.doctor_id;
    const patientId = selectedEMR?.patient_id;

    const doctorQuery = useQuery({
        queryKey: ["doctorById", doctorId],
        queryFn: () => doctorService.getDoctorById(doctorId as number),
        enabled: openDialog && typeof doctorId === "number",
    });

    const patientQuery = useQuery({
        queryKey: ["userById", patientId],
        queryFn: () => userService.getUserById(patientId as number),
        enabled: openDialog && typeof patientId === "number",
    });

    const handleViewEMR = (emr: EMR) => {
        setSelectedEMR(emr);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEMR(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {t('doctorEMR.failedToLoad')}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('doctorEMR.title')}</h1>
                <p className="text-muted-foreground mt-1">{t('doctorEMR.subtitle')}</p>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('common.id')}</TableHead>
                            <TableHead>{t('common.patient')}</TableHead>
                            <TableHead>{t('common.doctor')}</TableHead>
                            <TableHead>{t('common.specialization')}</TableHead>
                            <TableHead>{t('doctorEMR.chiefComplaint')}</TableHead>
                            <TableHead>{t('common.diagnosis')}</TableHead>
                            <TableHead>{t('common.date')}</TableHead>
                            <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rows.length > 0 ? (
                            rows.map((emr) => (
                                <TableRow key={emr.id}>
                                    <TableCell className="font-mono text-sm">{emr.id}</TableCell>

                                    <TableCell className="font-medium">
                                        {emr.patient_name ?? `#${emr.patient_id ?? "—"}`}
                                        {emr.patient_email ? (
                                            <div className="text-xs text-muted-foreground">{emr.patient_email}</div>
                                        ) : null}
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">
                                        Dr. {emr.doctor_name ?? `#${emr.doctor_id ?? "—"}`}
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">
                                        {emr.specialization_name ?? "—"}
                                    </TableCell>

                                    <TableCell className="max-w-[260px] truncate">
                                        {/* backend schema shows notes; keep chiefComplaint if your type has it */}
                                        {(emr as any).chiefComplaint ?? emr.notes ?? "—"}
                                    </TableCell>

                                    <TableCell>
                                        {emr.diagnosis ? (
                                            <Badge variant="success">{t('common.diagnosed')}</Badge>
                                        ) : (
                                            <Badge variant="warning">{t('common.pending')}</Badge>
                                        )}
                                        {emr.diagnosis ? (
                                            <div className="text-xs text-muted-foreground mt-1 max-w-[260px] truncate">
                                                {emr.diagnosis}
                                            </div>
                                        ) : null}
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">
                                        {emr.created_at ? format(new Date(emr.created_at), "MMM dd, yyyy") : "—"}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" title={t('common.viewDetails')}
                                                onClick={() => handleViewEMR(emr)}>
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20 text-muted-foreground"/>
                                    <p className="text-muted-foreground">{t('doctorEMR.noRecordsFound')}</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {total > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {t('common.showingRange', {from: page * rowsPerPage + 1, to: Math.min((page + 1) * rowsPerPage, total), total})} {t('doctorEMR.records')}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                            {t('common.previous')}
                        </Button>
                        <span className="text-sm">{t('common.pageOf', {page: page + 1, total: totalPages})}</span>
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

            <Dialog
                open={openDialog}
                onOpenChange={(open) => {
                    setOpenDialog(open);
                    if (!open) setSelectedEMR(null);
                }}
            >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('doctorEMR.recordDetails')}</DialogTitle>
                    </DialogHeader>

                    {selectedEMR && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* PATIENT BLOCK (user by patient_id) */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t('common.patient')}</p>
                                    <p className="font-medium">
                                        {patientQuery.data?.full_name ?? selectedEMR.patient_name ?? `#${selectedEMR.patient_id ?? "—"}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {patientQuery.data?.email ?? selectedEMR.patient_email ?? "—"}
                                    </p>
                                </div>

                                {/* DOCTOR BLOCK (doctor by doctor_id) */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t('common.doctor')}</p>
                                    <p className="font-medium">
                                        Dr. {doctorQuery.data?.full_name ?? selectedEMR.doctor_name ?? `#${selectedEMR.doctor_id ?? "—"}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {doctorQuery.data?.specialization_name ?? selectedEMR.specialization_name ?? "—"}
                                    </p>
                                </div>
                            </div>

                            <Separator/>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{t('doctorEMR.chiefComplaint')}</p>
                                <p>{(selectedEMR as any).chiefComplaint ?? selectedEMR.notes ?? "—"}</p>
                            </div>

                            {selectedEMR.diagnosis && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t('common.diagnosis')}</p>
                                    <p>{selectedEMR.diagnosis}</p>
                                </div>
                            )}

                            {(() => {
                                const parsed = parsePrescription(selectedEMR.prescription);
                                if (!parsed) return null;

                                // If it's an array of prescriptions
                                if (Array.isArray(parsed)) {
                                    return (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">{t('doctorEMR.prescriptions')}</p>
                                            <div className="space-y-2">
                                                {parsed.map((rx: any, index: number) => (
                                                    <div key={index} className="p-3 rounded-lg border bg-accent/20">
                                                        <p className="font-medium text-sm">{rx.medicationName ?? rx.name ?? `${t('doctorEMR.medication')} #${index + 1}`}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {rx.dosage ? `${t('doctorEMR.dosage')}: ${rx.dosage}` : null}
                                                            {rx.frequency ? ` | ${t('doctorEMR.frequency')}: ${rx.frequency}` : null}
                                                            {rx.duration ? ` | ${t('doctorEMR.duration')}: ${rx.duration}` : null}
                                                        </p>
                                                        {rx.instructions ? (
                                                            <p className="text-sm text-muted-foreground mt-1">{t('doctorEMR.instructions')}: {rx.instructions}</p>
                                                        ) : null}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                // Otherwise show as plain text
                                return (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{t('doctorEMR.prescription')}</p>
                                        <p className="whitespace-pre-wrap">{String(parsed)}</p>
                                    </div>
                                );
                            })()}

                            {/* Optional extras (only if your EMR type actually has them) */}
                            {(selectedEMR as any).medicalHistory ? (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t('doctorEMR.medicalHistory')}</p>
                                    <p>{(selectedEMR as any).medicalHistory}</p>
                                </div>
                            ) : null}

                            {(selectedEMR as any).vitalSigns ? (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('doctorEMR.vitalSigns')}</p>
                                    <pre className="text-sm p-3 rounded bg-accent/20 overflow-x-auto">
                    {JSON.stringify((selectedEMR as any).vitalSigns, null, 2)}
                  </pre>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleCloseDialog}>{t('common.close')}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
