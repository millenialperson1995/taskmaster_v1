import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TasksProvider } from './context/TasksContext.jsx';
import { Toaster } from 'react-hot-toast'; // Importado

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TasksProvider>
          <App />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              // Estilos para o modo claro
              style: {
                background: '#ffffff',
                color: '#1e293b',
              },
              // Estilos para o modo escuro
              dark: {
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                },
              },
              // Opções de sucesso
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              // Opções de erro
              error: {
                duration: 4000,
                 iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              }
            }}
          />
        </TasksProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);