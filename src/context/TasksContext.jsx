import { createContext, useMemo, useState, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databases, account, ID, Query, DATABASE_ID, TASKS_COLLECTION_ID } from '../api/appwrite';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const TasksContext = createContext();

const PAGE_SIZE = 10;

// CORREÇÃO: A função não pode usar hooks. O currentUser deve ser passado como parâmetro.
const fetchTasks = async ({ pageParam = 0, currentUser }) => {
    if (!currentUser) throw new Error("Usuário não autenticado para buscar tarefas.");

    const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
            Query.equal('userId', currentUser.$id),
            Query.orderDesc('$createdAt'),
            Query.limit(PAGE_SIZE),
            Query.offset(pageParam)
        ]
    );

    // Transforma os documentos antes de retornar
    const loadedTasks = response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
    }));
    
    return { tasks: loadedTasks, total: response.total };
};


export const TasksProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

    // --- LÓGICA DE BUSCA COM useInfiniteQuery ---
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['tasks', currentUser?.$id],
        // CORREÇÃO: Passa o currentUser para a função fetchTasks
        queryFn: ({ pageParam }) => fetchTasks({ pageParam, currentUser }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce((acc, page) => acc + page.tasks.length, 0);
            if (loadedCount < lastPage.total) {
                return loadedCount; // O próximo offset é a quantidade de itens já carregados
            }
            return undefined; // Não há mais páginas
        },
        // A query só é ativada quando o currentUser existe
        enabled: !!currentUser,
    });

    // Achata as páginas de tarefas em um único array para fácil renderização
    const tasks = useMemo(() => data?.pages.flatMap(page => page.tasks) ?? [], [data]);

    // --- MUTAÇÕES (addTask, updateTask, deleteTask) ---

    // MUTAÇÃO PARA ADICIONAR TAREFA
    const { mutate: addTask } = useMutation({
        mutationFn: async (taskData) => {
            if (!currentUser) throw new Error("Usuário não autenticado para adicionar tarefa.");
            const payload = {
                userId: currentUser.$id,
                text: taskData.text,
                category: taskData.category,
                priority: taskData.priority,
                dueDate: taskData.dueDate || null,
                reminderTime: taskData.reminderTime || null,
                recurrence: taskData.recurrence,
                completed: false,
                subtasks: JSON.stringify(taskData.subtasks || []),
            };
            return databases.createDocument(DATABASE_ID, TASKS_COLLECTION_ID, ID.unique(), payload);
        },
        onSuccess: () => {
            toast.success('Tarefa adicionada com sucesso!');
            // Invalida o cache para forçar uma nova busca dos dados atualizados
            queryClient.invalidateQueries({ queryKey: ['tasks', currentUser?.$id] });
        },
        onError: (err) => {
            toast.error('Falha ao adicionar a tarefa.');
            console.error("Erro ao adicionar tarefa:", err);
        }
    });

    // MUTAÇÃO PARA ATUALIZAR TAREFA (com update otimista)
    const { mutate: updateTask } = useMutation({
        mutationFn: async (updatedTaskData) => {
            const { id, ...data } = updatedTaskData;
            const payload = { ...data };
            
            // Remove campos internos do Appwrite que não devem ser enviados no update
            ['$id', '$collectionId', '$databaseId', '$createdAt', '$updatedAt', '$permissions'].forEach(key => delete payload[key]);
            
            payload.dueDate = payload.dueDate || null;
            payload.completionDate = payload.completionDate || null;
            // CORREÇÃO: Garante que subtasks seja um array antes de stringify
            payload.subtasks = JSON.stringify(payload.subtasks || []);

            return databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, id, payload);
        },
        onMutate: async (updatedTaskData) => {
            // Cancela queries pendentes para não sobrescrever o update otimista
            await queryClient.cancelQueries({ queryKey: ['tasks', currentUser?.$id] });
            
            // Salva o estado anterior do cache
            const previousTasksData = queryClient.getQueryData(['tasks', currentUser?.$id]);

            // Atualiza o cache otimisticamente
            queryClient.setQueryData(['tasks', currentUser?.$id], oldData => {
                if (!oldData) return oldData;
                const newPages = oldData.pages.map(page => ({
                    ...page,
                    tasks: page.tasks.map(task => task.id === updatedTaskData.id ? { ...task, ...updatedTaskData } : task),
                }));
                return { ...oldData, pages: newPages };
            });

            // Retorna o contexto com os dados antigos para rollback em caso de erro
            return { previousTasksData };
        },
        onError: (err, updatedTaskData, context) => {
            // Em caso de erro, reverte para o estado anterior
            if (context?.previousTasksData) {
                queryClient.setQueryData(['tasks', currentUser?.$id], context.previousTasksData);
            }
            toast.error('Falha ao atualizar a tarefa.');
            console.error("Erro ao atualizar tarefa:", err);
        },
        onSettled: () => {
            // No final (sucesso ou erro), invalida o cache para garantir consistência com o backend
            queryClient.invalidateQueries({ queryKey: ['tasks', currentUser?.$id] });
        },
    });

    // MUTAÇÃO PARA DELETAR TAREFA (com update otimista)
    const { mutate: deleteTask } = useMutation({
        mutationFn: (taskId) => databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, taskId),
        onMutate: async (deletedTaskId) => {
            await queryClient.cancelQueries({ queryKey: ['tasks', currentUser?.$id] });
            const previousTasksData = queryClient.getQueryData(['tasks', currentUser?.$id]);

            queryClient.setQueryData(['tasks', currentUser?.$id], oldData => {
                if (!oldData) return oldData;
                 const newPages = oldData.pages.map(page => ({
                    ...page,
                    tasks: page.tasks.filter(task => task.id !== deletedTaskId),
                }));
                return { ...oldData, pages: newPages };
            });
            
            return { previousTasksData };
        },
        onSuccess: () => {
            // MELHORIA: Toast de sucesso movido para cá.
            toast.success('Tarefa deletada com sucesso!');
        },
        onError: (err, deletedTaskId, context) => {
            if (context?.previousTasksData) {
                queryClient.setQueryData(['tasks', currentUser?.$id], context.previousTasksData);
            }
            toast.error('Falha ao deletar a tarefa.');
            console.error("Erro ao deletar tarefa:", err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentUser?.$id] });
        },
    });
    
    // Função helper para marcar como completa/incompleta
    const toggleComplete = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        const newCompletedStatus = !task.completed;
        const updatedTask = { 
            completed: newCompletedStatus, 
            completionDate: newCompletedStatus ? new Date().toISOString() : null 
        };
        
        // Passa o objeto da tarefa original mesclado com as atualizações
        // para que o update otimista funcione corretamente.
        updateTask({ ...task, ...updatedTask });
    };

    // --- LÓGICA DE CATEGORIAS ---
    const [categories, setCategories] = useState(['Trabalho', 'Pessoal', 'Estudos']);
    
    useEffect(() => {
      const fetchUserPreferences = async () => {
          if (!currentUser) return;
          try {
              const prefs = await account.getPrefs();
              if (prefs.categories && Array.isArray(prefs.categories) && prefs.categories.length > 0) {
                  setCategories(prefs.categories);
              }
          } catch (e) {
              // Appwrite pode lançar um erro 404 se as preferências nunca foram definidas, isso é normal.
              if (e.code !== 404) {
                console.error("Falha ao buscar preferências do usuário:", e);
              }
          }
      };
      fetchUserPreferences();
    }, [currentUser]);

    const addCategory = async (cat) => {
      if (cat && !categories.includes(cat)) {
          const newCategories = [...categories, cat];
          setCategories(newCategories);
          try { 
              await account.updatePrefs({ categories: newCategories }); 
          }
          catch (e) { 
              console.error("Falha ao salvar categoria nas preferências:", e);
              // Opcional: reverter o estado local se a atualização falhar
              setCategories(categories);
              toast.error("Não foi possível salvar a nova categoria.");
          }
      }
    };
    
    // O Drag and Drop precisa de uma abordagem diferente com React Query.
    const setPendingTasks = () => {
      console.warn("A função 'setPendingTasks' para drag-and-drop precisa ser reimplementada para funcionar com o cache do React Query e persistir as mudanças no backend.");
    };

    const value = {
        tasks,
        categories,
        isLoading,
        isFetchingMore: isFetchingNextPage,
        hasMoreTasks: hasNextPage,
        fetchMoreTasks: fetchNextPage,
        error,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addCategory,
        setPendingTasks
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};