"use client"

import type React from "react"
import {useState} from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {useTranslation} from "react-i18next"
import {Plus, Search, Edit, Trash2, Star, Eye} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog"
import {DoctorForm} from "@/components/forms/DoctorForm"
import {doctorService} from "@/services/doctorService.ts"
import type {Doctor, PaginatedResponse} from "@/types"

export const Doctors: React.FC = () => {
    const {t} = useTranslation()
    const [searchQuery, setSearchQuery] = useState("")
    const [page] = useState(0)
    const rowsPerPage = 10
    const queryClient = useQueryClient()

    const [openForm, setOpenForm] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
    const [formMode, setFormMode] = useState<"create" | "edit">("create")

    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewDoctor, setPreviewDoctor] = useState<Doctor | null>(null)

    const {data, isLoading} = useQuery<Doctor[] | PaginatedResponse<Doctor>>({
        queryKey: ["doctors", page + 1, rowsPerPage],
        queryFn: () => doctorService.getDoctors(page + 1, rowsPerPage),
    })

    const deleteDoctorMutation = useMutation({
        mutationFn: (doctorId: number) => doctorService.deleteDoctor(doctorId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["doctors"]})
        },
    })

    const handleCreateDoctor = () => {
        setFormMode("create")
        setSelectedDoctor(null)
        setOpenForm(true)
    }

    const handleEditDoctor = (doctor: Doctor) => {
        setFormMode("edit")
        setSelectedDoctor(doctor)
        setOpenForm(true)
    }

    const handleDeleteDoctor = async (doctorId: number) => {
        if (window.confirm(t('adminDoctors.confirmDelete'))) {
            try {
                await deleteDoctorMutation.mutateAsync(doctorId)
            } catch (error) {
                console.error("Failed to delete doctor:", error)
                alert(t('adminDoctors.deleteFailed'))
            }
        }
    }

    const handlePreviewDoctor = (doctor: Doctor) => {
        setPreviewDoctor(doctor)
        setPreviewOpen(true)
    }

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({queryKey: ["doctors"]})
        setOpenForm(false)
        setSelectedDoctor(null)
    }

    const doctors: Doctor[] = Array.isArray(data) ? data : (data?.data ?? [])

    const filteredDoctors = doctors.filter((doctor) => {
        const q = searchQuery.toLowerCase()
        return doctor?.full_name?.toLowerCase().includes(q) || doctor?.specialization_name?.toLowerCase().includes(q)
    })

    const getStatusBadge = (status?: string) => {
        console.log(status)
        switch (status) {
            case "approved":
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            case "rejected":
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            default:
                return <Badge variant="outline">{status || "Unknown"}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('adminDoctors.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('adminDoctors.subtitle')}</p>
                </div>
                <Button onClick={handleCreateDoctor}>
                    <Plus className="mr-2 h-4 w-4"/>
                    {t('adminDoctors.registerDoctor')}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder={t('placeholders.searchDoctors')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('common.name')}</TableHead>
                            <TableHead>{t('adminDoctors.specialty')}</TableHead>
                            <TableHead>{t('adminDoctors.license')}</TableHead>
                            <TableHead>{t('adminDoctors.experience')}</TableHead>
                            <TableHead>{t('common.rating')}</TableHead>
                            <TableHead>{t('common.status')}</TableHead>
                            <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredDoctors?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {t('adminDoctors.noDoctors')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDoctors?.map((doctor) => (
                                <TableRow key={doctor.id}>
                                    <TableCell className="font-medium">Dr. {doctor?.full_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{doctor.specialization_name}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{doctor.license_number}</TableCell>
                                    <TableCell
                                        className="text-muted-foreground">{doctor.experience_years} yrs</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                            <span
                                                className="text-sm font-medium">{doctor.rating?.toFixed(1) || "N/A"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Preview doctor"
                                                onClick={() => handlePreviewDoctor(doctor)}
                                            >
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Edit doctor"
                                                    onClick={() => handleEditDoctor(doctor)}>
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Delete doctor"
                                                onClick={() => handleDeleteDoctor(doctor.id)}
                                                disabled={deleteDoctorMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{t('adminDoctors.doctorDetails')}</DialogTitle>
                        <DialogDescription>{t('adminDoctors.fullInformation')}</DialogDescription>
                    </DialogHeader>
                    {previewDoctor && (
                        <div className="space-y-6">
                            {/* Header with name and status */}
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h3 className="text-2xl font-semibold">Dr. {previewDoctor.full_name}</h3>
                                    <p className="text-muted-foreground">{previewDoctor.specialization_name}</p>
                                </div>
                                {getStatusBadge(previewDoctor.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('adminDoctors.email')}</p>
                                    <p className="font-medium">{previewDoctor.email || t('common.na')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('common.phone')}</p>
                                    <p className="font-medium">{previewDoctor.phone || t('common.na')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('adminDoctors.license')}</p>
                                    <p className="font-medium">{previewDoctor.license_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('adminDoctors.experience')}</p>
                                    <p className="font-medium">{previewDoctor.experience_years} {t('common.years')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('common.rating')}</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                        <span className="font-medium">{previewDoctor.rating?.toFixed(1) || t('common.na')}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('adminDoctors.registeredOn')}</p>
                                    <p className="font-medium">{new Date(previewDoctor.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Bio section */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">{t('adminDoctors.bio')}</p>
                                <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                                    {previewDoctor.bio || t('adminDoctors.noBio')}
                                </p>
                            </div>

                            {/* Rejection reason if rejected */}
                            {previewDoctor.status === "rejected" && previewDoctor.rejection_reason && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{t('adminDoctors.rejectionReason')}</p>
                                    <p className="text-sm leading-relaxed bg-red-50 text-red-800 p-3 rounded-md">
                                        {previewDoctor.rejection_reason}
                                    </p>
                                </div>
                            )}

                            {/* IDs section */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t text-xs text-muted-foreground">
                                <div>
                                    <span>{t('adminDoctors.doctorId')}: </span>
                                    <span className="font-mono">{previewDoctor.id}</span>
                                </div>
                                <div>
                                    <span>{t('adminDoctors.userId')}: </span>
                                    <span className="font-mono">{previewDoctor.user_id}</span>
                                </div>
                                <div>
                                    <span>{t('adminDoctors.specializationId')}: </span>
                                    <span className="font-mono">{previewDoctor.specialization_id}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <DoctorForm
                open={openForm}
                onClose={() => {
                    setOpenForm(false)
                    setSelectedDoctor(null)
                }}
                onSuccess={handleFormSuccess}
                doctor={selectedDoctor}
                mode={formMode}
            />
        </div>
    )
}
