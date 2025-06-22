import { Client, Account, Databases, ID, Query } from 'appwrite';

// Use as variáveis de ambiente
const VITE_APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const VITE_APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID;

const client = new Client();

client
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export { ID, Query };

// --- FUNÇÕES DE API PARA AUTENTICAÇÃO ---

export const checkUserSession = async () => {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
};

export const loginUser = ({ email, password }) => {
    return account.createEmailPasswordSession(email, password);
};

export const signupUser = ({ email, password, name }) => {
    return account.create(ID.unique(), email, password, name);
};

export const logoutUser = () => {
    return account.deleteSession('current');
};


// --- FUNÇÕES DE API PARA TAREFAS ---

const PAGE_SIZE = 15;

export const getTasks = async ({ pageParam = 0 }) => {
    const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
            Query.orderDesc('$createdAt'),
            Query.limit(PAGE_SIZE),
            Query.offset(pageParam * PAGE_SIZE),
        ]
    );

    // Parse subtasks no nível da API
    const documents = response.documents.map(doc => ({
        ...doc,
        id: doc.$id, // Garante que 'id' esteja disponível
        subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
    }));
    
    return {
        documents,
        nextCursor: documents.length === PAGE_SIZE ? pageParam + 1 : undefined,
    };
};

export const addTask = (taskData) => {
    const payload = {
        userId: taskData.userId,
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
};

export const updateTask = (taskData) => {
    // Clona o objeto para não modificar o original do cache do React Query
    const payload = { ...taskData };

    // Remove propriedades do Appwrite que não devem ser enviadas no update
    delete payload.id;
    delete payload.$id;
    delete payload.$collectionId;
    delete payload.$databaseId;
    delete payload.$createdAt;
    delete payload.$updatedAt;
    delete payload.$permissions;
    
    // Garante que subtasks seja uma string JSON
    payload.subtasks = JSON.stringify(payload.subtasks || '[]');

    return databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, taskData.id, payload);
};

export const deleteTask = (taskId) => {
    return databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, taskId);
};

// --- FUNÇÕES DE API PARA PREFERÊNCIAS ---
export const getUserPreferences = async () => {
    return account.getPrefs();
};

export const updateUserCategories = (categories) => {
    return account.updatePrefs({ categories });
}