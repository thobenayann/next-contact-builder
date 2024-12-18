'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { Pencil, Trash2, FileText } from 'lucide-react';
import type { EmployeeWithContract } from '@/lib/types';

interface EmployeesListProps {
    initialEmployees: EmployeeWithContract[];
}

export function EmployeesList({ initialEmployees = [] }: EmployeesListProps) {
    const router = useRouter();
    const { addToast } = useToast();
    const [employees, setEmployees] =
        useState<EmployeeWithContract[]>(initialEmployees);
    const [deleteEmployee, setDeleteEmployee] =
        useState<EmployeeWithContract | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!deleteEmployee) return;
        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/employees/${deleteEmployee.id}`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) throw new Error('Erreur lors de la suppression');

            setEmployees(employees.filter((e) => e.id !== deleteEmployee.id));
            addToast({
                title: 'Succès',
                description: 'Employé supprimé avec succès',
                type: 'success',
            });
            setDeleteEmployee(null);
            router.refresh();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            addToast({
                title: 'Erreur',
                description: "Impossible de supprimer l'employé",
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Liste des employés</h2>
                <Button
                    onClick={() => router.push('/dashboard/employees/create')}
                >
                    Nouvel employé
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Date de naissance</TableHead>
                            <TableHead>N° SS</TableHead>
                            <TableHead>Contrat</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>
                                    {employee.lastName} {employee.firstName}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(employee.birthdate), 'P', {
                                        locale: fr,
                                    })}
                                </TableCell>
                                <TableCell>{employee.ssn}</TableCell>
                                <TableCell>
                                    {employee.contract ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (employee.contract) {
                                                    router.push(
                                                        `/dashboard/contracts/${employee.contract.id}`
                                                    );
                                                }
                                            }}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Voir le contrat
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/contracts/create?employeeId=${employee.id}`
                                                )
                                            }
                                        >
                                            Créer un contrat
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/employees/edit?id=${employee.id}`
                                            )
                                        }
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setDeleteEmployee(employee)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DeleteConfirmDialog
                isOpen={!!deleteEmployee}
                onClose={() => setDeleteEmployee(null)}
                onConfirm={handleDelete}
                title={
                    deleteEmployee
                        ? `${deleteEmployee.lastName} ${deleteEmployee.firstName}`
                        : ''
                }
                isLoading={isLoading}
            />
        </div>
    );
}