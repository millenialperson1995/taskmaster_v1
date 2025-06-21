import { createContext, useState, useEffect, useCallback } from 'react';
import { databases, account, ID, Query, DATABASE_ID, TASKS_COLLECTION_ID } from '../api/appwrite';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const TasksContext = createContext();

const PAGE_SIZE = 5; // Define o número de tarefas a serem buscadas por vez

export const TasksProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState(['Trabalho', 'Pessoal', 'Estudos']);
    
    // Estados para controle de carregamento
    const [loadingTasks, setLoadingTasks] = useState(true); // Loading inicial
    const [isFetchingMore, setIsFetchingMore] = useState(false); // Loading de "carregar mais"
    const [hasMoreTasks, setHasMoreTasks] = useState(true); // Controla se há mais tarefas no DB

    // Função de busca inicial (primeira página)
    const fetchTasks = useCallback(async () => {
        if (!currentUser) return;

        setLoadingTasks(true);
        setHasMoreTasks(true); // Reseta ao buscar do zero

        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [
                    Query.equal('userId', currentUser.$id), 
                    Query.orderDesc('$createdAt'),
                    Query.limit(PAGE_SIZE), // Busca a primeira página
                ]
            );
            
            const loadedTasks = response.documents.map(doc => ({
                ...doc,
                id: doc.$id,
                subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
            }));

            setTasks(loadedTasks);

            // Se o número de documentos retornados for menor que o tamanho da página, não há mais o que buscar
            if (response.documents.length < PAGE_SIZE) {
                setHasMoreTasks(false);
            }

        } catch (error) {
            console.error("Falha ao buscar tarefas:", error);
            toast.error("Não foi possível carregar suas tarefas.");
        } finally {
            setLoadingTasks(false);
        }
    }, [currentUser]);
    
    // Nova função para buscar as próximas páginas
    const fetchMoreTasks = useCallback(async () => {
        // Evita buscas duplicadas enquanto uma já está em andamento
        if (isFetchingMore || !hasMoreTasks) return;

        setIsFetchingMore(true);
        
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [
                    Query.equal('userId', currentUser.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(PAGE_SIZE),
                    Query.offset(tasks.length) // O "pulo" é o número de tarefas já carregadas
                ]
            );
            
            if (response.documents.length > 0) {
                 const newTasks = response.documents.map(doc => ({
                    ...doc,
                    id: doc.$id,
                    subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
                }));
                // Adiciona as novas tarefas ao final da lista existente
                setTasks(prevTasks => [...prevTasks, ...newTasks]);
            }

            // Se a resposta trouxe menos tarefas que o limite, desativa buscas futuras
            if (response.documents.length < PAGE_SIZE) {
                setHasMoreTasks(false);
            }

        } catch (error) {
            console.error("Falha ao buscar mais tarefas:", error);
            toast.error("Erro ao carregar mais tarefas.");
        } finally {
            setIsFetchingMore(false);
        }

    }, [currentUser, tasks.length, isFetchingMore, hasMoreTasks]);

    // ... (função fetchUserPreferences continua a mesma)
    const fetchUserPreferences = useCallback(async () => {
        if (!currentUser) return;
        try {
            const prefs = await account.getPrefs();
            if (prefs.categories && prefs.categories.length > 0) {
                setCategories(prefs.categories);
            }
        } catch (e) {
            console.error("Falha ao buscar preferências de usuário", e);
        }
    }, [currentUser]);


    useEffect(() => {
        if (currentUser) {
            fetchUserPreferences();
            fetchTasks(); // Chama a busca inicial
        } else {
            setTasks([]);
            setLoadingTasks(false);
        }
    }, [currentUser, fetchTasks, fetchUserPreferences]);
    
    // addTask agora adiciona a tarefa no início da lista para feedback imediato
    const addTask = async (taskData) => {
        // ... (lógica do addTask continua a mesma)
        try {
            const payload = {
                userId: currentUser.$id, text: taskData.text, category: taskData.category,
                priority: taskData.priority, dueDate: taskData.dueDate || null,
                reminderTime: taskData.reminderTime || null, recurrence: taskData.recurrence,
                completed: false, subtasks: JSON.stringify(taskData.subtasks || []),
            };
            const response = await databases.createDocument(DATABASE_ID, TASKS_COLLECTION_ID, ID.unique(), payload);
            const newTask = { ...response, id: response.$id, subtasks: JSON.parse(response.subtasks || '[]') };
            setTasks(prev => [newTask, ...prev]);
            toast.success('Tarefa adicionada com sucesso!');
        } catch (error) { 
            console.error("Falha ao adicionar tarefa:", error);
            toast.error('Falha ao adicionar a tarefa.');
        }
    };

    const updateTask = async (updatedTaskData) => {
        // ... (lógica do updateTask continua a mesma)
        try {
            const { id, ...data } = updatedTaskData;
            const payload = { ...data };
            ['$collectionId', '$databaseId', '$createdAt', '$updatedAt', '$permissions'].forEach(key => delete payload[key]);
            payload.dueDate = payload.dueDate || null;
            payload.completionDate = payload.completionDate || null;
            payload.subtasks = JSON.stringify(payload.subtasks || '[]');

            await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, id, payload);
            setTasks(prev => prev.map(t => (t.id === id ? updatedTaskData : t)));
        } catch (error) { 
            console.error("Falha ao atualizar tarefa:", error);
            toast.error('Falha ao atualizar a tarefa.');
        }
    };

    const deleteTask = async (id) => {
        // ... (lógica do deleteTask continua a mesma)
         try {
            await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, id);
            setTasks(prev => prev.filter(t => t.id !== id));
            toast.success('Tarefa deletada com sucesso!');
        } catch (error) { 
            console.error("Falha ao deletar tarefa:", error);
            toast.error('Falha ao deletar a tarefa.');
        }
    };

    const toggleComplete = (id) => {
        // ... (lógica do toggleComplete continua a mesma)
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newCompletedStatus = !task.completed;
        const updatedTask = { ...task, completed: newCompletedStatus, completionDate: newCompletedStatus ? new Date().toISOString() : null };
        updateTask(updatedTask);
    };

    const addCategory = async (cat) => {
        // ... (lógica do addCategory continua a mesma)
        if (cat && !categories.includes(cat)) {
            const newCategories = [...categories, cat];
            setCategories(newCategories);
            try { await account.updatePrefs({ categories: newCategories }); }
            catch (e) { console.error("Falha ao salvar categoria", e); }
        }
    };
    
    const setPendingTasks = (newPendingTasks) => {
      // ... (lógica do setPendingTasks continua a mesma)
      const completedTasks = tasks.filter(t => t.completed);
      setTasks([...newPendingTasks, ...completedTasks]);
    }

    const value = {
        tasks,
        categories,
        loadingTasks,
        isFetchingMore, // Exporta o novo estado
        hasMoreTasks,   // Exporta o novo estado
        fetchMoreTasks, // Exporta a nova função
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addCategory,
        setPendingTasks
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};