import { createContext, useState, useMemo } from 'react';
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
    getTasks,
    addTask as apiAddTask,
    updateTask as apiUpdateTask,
    deleteTask as apiDeleteTask,
    getUserPreferences,
    updateUserCategories,
} from '../api/appwrite';

export const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

    // Estado local para os filtros
    const [filterCategory, setFilterCategory] = useState('Todos');
    const [filterPriority, setFilterPriority] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- React Query Hooks ---

    // Query para buscar as categorias do usuário
    const { data: categories = ['Trabalho', 'Pessoal', 'Estudos'] } = useQuery({
        queryKey: ['user-preferences', currentUser?.$id],
        queryFn: getUserPreferences,
        select: (data) => data.categories || ['Trabalho', 'Pessoal', 'Estudos'],
        enabled: !!currentUser, // Só executa se o usuário estiver logado
    });

    // Query infinita para buscar e paginar tarefas
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        isLoading: isLoadingTasks,
    } = useInfiniteQuery({
        queryKey: ['tasks', currentUser?.$id],
        queryFn: getTasks,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: 0,
        enabled: !!currentUser,
    });
    
    // Mutação para adicionar uma nova tarefa
    const { mutate: addTask } = useMutation({
        mutationFn: (taskData) => apiAddTask({ ...taskData, userId: currentUser.$id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentUser?.$id] });
            toast.success('Tarefa adicionada!');
        },
        onError: () => toast.error('Falha ao adicionar a tarefa.'),
    });

    // Mutação para atualizar uma tarefa
    const { mutate: updateTask } = useMutation({
        mutationFn: apiUpdateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentUser?.$id] });
        },
        onError: () => toast.error('Falha ao atualizar a tarefa.'),
    });
    
    // Mutação para deletar uma tarefa
    const { mutate: deleteTask } = useMutation({
        mutationFn: apiDeleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentUser?.$id] });
            toast.success('Tarefa deletada!');
        },
        onError: () => toast.error('Falha ao deletar a tarefa.'),
    });

    // Mutação para adicionar uma nova categoria
    const { mutate: addCategory } = useMutation({
        mutationFn: async (newCategory) => {
            if (newCategory && !categories.includes(newCategory)) {
                const newCategories = [...categories, newCategory];
                await updateUserCategories(newCategories);
                return newCategories;
            }
            return categories; // Retorna o array original se nada mudar
        },
        onSuccess: (newCategories) => {
            queryClient.setQueryData(['user-preferences', currentUser?.$id], { categories: newCategories });
            toast.success('Categoria adicionada!');
        },
        onError: () => toast.error('Falha ao salvar a categoria.'),
    });

    // --- Lógica Derivada ---

    const allTasks = useMemo(() => data?.pages.flatMap(page => page.documents) ?? [], [data]);

    const filteredTasks = useMemo(() => {
        return allTasks
            .filter(task => filterCategory === 'Todos' || task.category === filterCategory)
            .filter(task => filterPriority === 'Todos' || task.priority === filterPriority)
            .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allTasks, filterCategory, filterPriority, searchTerm]);

    const toggleComplete = (task) => {
        if (!task) return;
        const newCompletedStatus = !task.completed;
        const updatedTask = { 
            ...task, 
            completed: newCompletedStatus, 
            completionDate: newCompletedStatus ? new Date().toISOString() : null 
        };
        updateTask(updatedTask);
    };

    const value = {
        tasks: allTasks,
        filteredTasks,
        categories,
        isLoadingTasks,
        isFetchingMore: isFetchingNextPage,
        hasMoreTasks: hasNextPage,
        fetchMoreTasks: fetchNextPage,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addCategory,
        searchTerm,
        setSearchTerm,
        filterCategory,
        setFilterCategory,
        filterPriority,
        setFilterPriority,
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};