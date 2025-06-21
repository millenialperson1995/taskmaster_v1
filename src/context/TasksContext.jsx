import { createContext, useState, useEffect, useCallback } from 'react';
import { databases, account, ID, Query, DATABASE_ID, TASKS_COLLECTION_ID } from '../api/appwrite';
import { useAuth } from '../hooks/useAuth';

export const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState(['Trabalho', 'Pessoal', 'Estudos']);
    const [loadingTasks, setLoadingTasks] = useState(true);

    const fetchTasks = useCallback(async () => {
        if (!currentUser) return;
        setLoadingTasks(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [Query.equal('userId', currentUser.$id), Query.orderDesc('$createdAt')]
            );
            const loadedTasks = response.documents.map(doc => ({
                ...doc,
                id: doc.$id,
                subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
            }));
            setTasks(loadedTasks);
        } catch (error) {
            console.error("Falha ao buscar tarefas:", error);
        } finally {
            setLoadingTasks(false);
        }
    }, [currentUser]);

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
            const response = await databases.createDocument(DATABASE_ID, TASKS_COLLECTION_ID, ID.unique(), payload);
            const newTask = { ...response, id: response.$id, subtasks: JSON.parse(response.subtasks || '[]') };
            setTasks(prev => [newTask, ...prev]);
        } catch (error) { console.error("Falha ao adicionar tarefa:", error); }
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
        } catch (error) { console.error("Falha ao atualizar tarefa:", error); }
    };

    const deleteTask = async (id) => {
        try {
            await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) { console.error("Falha ao deletar tarefa:", error); }
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
      setTasks([...newPendingTasks, ...completedTasks]);
    }

    const value = {
        tasks,
        categories,
        loadingTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addCategory,
        setPendingTasks
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};