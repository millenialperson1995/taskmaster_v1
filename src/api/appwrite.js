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