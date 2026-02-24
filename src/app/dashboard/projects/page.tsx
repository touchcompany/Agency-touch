'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { Loader2, Plus, List, LayoutGrid, Filter, X, Clock, User, CheckCircle } from 'lucide-react';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { ProjectsKanbanView } from '@/components/projects/projects-kanban-view';
import { ProjectsListView } from '@/components/projects/projects-list-view';

type View = 'kanban' | 'list';

export default function ProjectsPage() {
    const { firestore, user } = useFirebase();
    const [view, setView] = useState<View>('kanban');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Partial<Project> | undefined>(undefined);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [customerFilter, setCustomerFilter] = useState('all');
    const [collaboratorFilter, setCollaboratorFilter] = useState('all');
    
    // Data fetching
    const projectsQuery = useMemoFirebase(() => (user ? query(collection(firestore, 'users', user.uid, 'projects'),) : null), [firestore, user]);
    const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

    const customersQuery = useMemoFirebase(() => (user ? collection(firestore, 'users', user.uid, 'customers') : null), [firestore, user]);
    const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

    const collaboratorsQuery = useMemoFirebase(() => (user ? collection(firestore, 'users', user.uid, 'collaborators') : null), [firestore, user]);
    const { data: collaborators, isLoading: collaboratorsLoading } = useCollection<Collaborator>(collaboratorsQuery);

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        return projects.filter(p => {
            const searchMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter === 'all' || p.status === statusFilter;
            const customerMatch = customerFilter === 'all' || p.customerId === customerFilter;
            const collaboratorMatch = collaboratorFilter === 'all' || p.collaboratorId === collaboratorFilter;
            return searchMatch && statusMatch && customerMatch && collaboratorMatch;
        });
    }, [projects, searchQuery, statusFilter, customerFilter, collaboratorFilter]);

    const handleOpenDialog = (project?: Partial<Project>) => {
        setSelectedProject(project);
        setIsDialogOpen(true);
    };
    
    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCustomerFilter('all');
        setCollaboratorFilter('all');
    }

    const isLoading = projectsLoading || customersLoading || collaboratorsLoading;

    // Summary cards data
    const summary = useMemo(() => {
        const initial: Record<Project['status'] | 'total', number> = { pending: 0, 'in-progress': 0, 'customer-review': 0, completed: 0, total: 0 };
        if (!projects) return initial;
        return projects.reduce((acc, p) => {
            if (p.status) {
                if(acc[p.status] !== undefined) {
                    acc[p.status]++;
                }
            }
            acc.total++;
            return acc;
        }, initial);
    }, [projects]);
    
    const summaryCards = [
        { title: 'Pendientes', count: summary.pending, icon: Clock, color: 'text-yellow-500' },
        { title: 'En Progreso', count: summary['in-progress'], icon: Loader2, color: 'text-blue-500', spin: true },
        { title: 'Revisión Cliente', count: summary['customer-review'], icon: User, color: 'text-purple-500' },
        { title: 'Completadas', count: summary.completed, icon: CheckCircle, color: 'text-green-500' },
    ];


    return (
        <div className="flex h-full flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Gestor de Tareas</h1>
                    <p className="text-muted-foreground">Organiza y gestiona tus tareas y proyectos</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-md bg-muted p-1">
                        <Button variant={view === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setView('kanban')}>
                            <LayoutGrid className="h-4 w-4 mr-2"/> Kanban
                        </Button>
                        <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')}>
                            <List className="h-4 w-4 mr-2"/> Lista
                        </Button>
                    </div>
                    <Button onClick={() => handleOpenDialog(undefined)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Tarea
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center mb-4 gap-2">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Filtros</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Input 
                            placeholder="Buscar tareas..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="lg:col-span-2"
                        />
                        <Select value={customerFilter} onValueChange={setCustomerFilter}>
                            <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Clientes</SelectItem>
                                {customers?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Estados</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="in-progress">En Progreso</SelectItem>
                                <SelectItem value="customer-review">Revisión Cliente</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                            <SelectTrigger><SelectValue placeholder="Responsable" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Responsables</SelectItem>
                                {collaborators?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex justify-end mt-4">
                        <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" /> Limpiar todos los filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
             <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {summaryCards.map(card => (
                     <Card key={card.title}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">{card.title}</div>
                                <div className="text-2xl font-bold">{card.count}</div>
                            </div>
                            <div className={`p-2 rounded-md bg-muted ${card.color}`}>
                                <card.icon className={`h-6 w-6 ${card.spin ? 'animate-spin' : ''}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
             </div>

            {/* Main Content */}
            {isLoading ? (
                 <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
            ) : view === 'kanban' ? (
                <ProjectsKanbanView 
                    projects={filteredProjects}
                    customers={customers || []}
                    collaborators={collaborators || []}
                    onCardClick={handleOpenDialog}
                />
            ) : (
                <ProjectsListView 
                    projects={filteredProjects}
                    customers={customers || []}
                    collaborators={collaborators || []}
                    onRowClick={handleOpenDialog}
                />
            )}

            <ProjectFormDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                project={selectedProject}
            />
        </div>
    );
}
