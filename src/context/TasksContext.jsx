import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { databases, account, ID, Query, DATABASE_ID, TASKS_COLLECTION_ID } from '../api/appwrite';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const TasksContext = createContext();

const PAGE_SIZE = 10; // Aumentado para melhor UX

export const TasksProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState(['Trabalho', 'Pessoal', 'Estudos']);
    
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMoreTasks, setHasMoreTasks] = useState(true);

    const [filterCategory, setFilterCategory] = useState('Todos');
    const [filterPriority, setFilterPriority] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTasks = useCallback(async () => {
        if (!currentUser) return;
        setLoadingTasks(true);
        setHasMoreTasks(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [
                    Query.equal('userId', currentUser.$id), 
                    Query.orderDesc('$createdAt'),
                    Query.limit(PAGE_SIZE),
                ]
            );
            const loadedTasks = response.documents.map(doc => ({
                ...doc,
                id: doc.$id,
                subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
            }));
            setTasks(loadedTasks);
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
    
    const fetchMoreTasks = useCallback(async () => {
        if (isFetchingMore || !hasMoreTasks || !currentUser) return;
        setIsFetchingMore(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [
                    Query.equal('userId', currentUser.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(PAGE_SIZE),
                    Query.offset(tasks.length)
                ]
            );
            if (response.documents.length > 0) {
                 const newTasks = response.documents.map(doc => ({
                    ...doc,
                    id: doc.$id,
                    subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
                }));
                setTasks(prevTasks => [...prevTasks, ...newTasks]);
            }
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
            fetchTasks();
        } else {
            setTasks([]);
            setLoadingTasks(false);
        }
    }, [currentUser, fetchTasks, fetchUserPreferences]);
    
    const addTask = async (taskData) => {
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
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newCompletedStatus = !task.completed;
        const updatedTask = { ...task, completed: newCompletedStatus, completionDate: newCompletedStatus ? new Date().toISOString() : null };
        updateTask(updatedTask);
    };

    const addCategory = async (cat) => {
        if (cat && !categories.includes(cat)) {
            const newCategories = [...categories, cat];
            setCategories(newCategories);
            try { await account.updatePrefs({ categories: newCategories }); }
            catch (e) { console.error("Falha ao salvar categoria", e); }
        }
    };
    
    const setPendingTasks = (newPendingTasks) => {
      const completedTasks = tasks.filter(t => t.completed);
      const allOtherTasks = tasks.filter(t => !newPendingTasks.some(nt => nt.id === t.id) && !t.completed);
      setTasks([...newPendingTasks, ...allOtherTasks, ...completedTasks]);
    }

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => filterCategory === 'Todos' || task.category === filterCategory)
            .filter(task => filterPriority === 'Todos' || task.priority === filterPriority)
            .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tasks, filterCategory, filterPriority, searchTerm]);

    const value = {
        tasks,
        filteredTasks,
        categories,
        loadingTasks,
        isFetchingMore,
        hasMoreTasks,
        fetchMoreTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addCategory,
        setPendingTasks,
        searchTerm,
        setSearchTerm,
        filterCategory,
        setFilterCategory,
        filterPriority,
        setFilterPriority,
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};