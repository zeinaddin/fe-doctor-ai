import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {Plus, Search, Edit, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {UserForm} from '@/components/forms/UserForm';
import {userService} from '../../services/userService';
import type {User, UserFormData, RegisterRequest} from '../../types';
import {getUserRole} from '../../types';

export const Users: React.FC = () => {
    const {t} = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [page] = useState(0);
    const rowsPerPage = 10;
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // API returns array directly
    const {data: users = [], isLoading} = useQuery<User[]>({
        queryKey: ['users', page, rowsPerPage],
        queryFn: () => userService.getUsers(page * rowsPerPage, rowsPerPage),
    });

    const createUserMutation = useMutation({
        mutationFn: (userData: RegisterRequest) => userService.createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']});
            setOpenForm(false);
            setSelectedUser(null);
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({id, data}: { id: number; data: Partial<RegisterRequest> }) =>
            userService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']});
            setOpenForm(false);
            setSelectedUser(null);
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: number) => userService.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']});
        },
    });

    const handleCreateUser = () => {
        setFormMode('create');
        setSelectedUser(null);
        setOpenForm(true);
    };

    const handleEditUser = (user: User) => {
        setFormMode('edit');
        setSelectedUser(user);
        setOpenForm(true);
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm(t('adminUsers.confirmDelete'))) {
            try {
                await deleteUserMutation.mutateAsync(userId);
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert(t('adminUsers.deleteFailed'));
            }
        }
    };

    const handleFormSubmit = async (formData: UserFormData) => {
        try {
            if (formMode === 'create') {
                const registerData: RegisterRequest = {
                    email: formData.email,
                    password: formData.password || '',
                    full_name: formData.firstName + ' ' + formData.lastName,
                    phone: formData.phone,
                    role: formData.role,
                };
                await createUserMutation.mutateAsync(registerData);
            } else if (selectedUser) {
                const updateData: Partial<RegisterRequest> = {
                    full_name: formData.firstName + ' ' + formData.lastName,
                    phone: formData.phone,
                };
                await updateUserMutation.mutateAsync({id: selectedUser.id, data: updateData});
            }
        } catch (error) {
            console.error('Failed to save user:', error);
            alert(t('adminUsers.saveFailed'));
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'destructive';
            case 'DOCTOR':
                return 'default';
            case 'PATIENT':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('adminUsers.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('adminUsers.subtitle')}</p>
                </div>
                <Button onClick={handleCreateUser}>
                    <Plus className="mr-2 h-4 w-4"/>
                    {t('adminUsers.addUser')}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder={t('placeholders.searchUsers')}
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
                            <TableHead>{t('common.email')}</TableHead>
                            <TableHead>{t('adminUsers.role')}</TableHead>
                            <TableHead>{t('common.phone')}</TableHead>
                            <TableHead>{t('common.created')}</TableHead>
                            <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex justify-center">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t('adminUsers.noUsersFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.full_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(getUserRole(user)) as any}>
                                            {getUserRole(user)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.phone || '—'}</TableCell>
                                    <TableCell className="text-muted-foreground">—</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Edit user"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Delete user"
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={deleteUserMutation.isPending}
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

            <UserForm
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleFormSubmit}
                user={selectedUser}
                mode={formMode}
            />
        </div>
    );
};
