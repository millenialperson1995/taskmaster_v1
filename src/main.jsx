import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TasksProvider } from './context/TasksContext.jsx';
import { Toaster } from 'react-hot-toast';

// --- ACRESCENTADO ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Criar uma instância do client
const queryClient = new QueryClient();
// --------------------


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* --- ACRESCENTADO --- */}
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TasksProvider>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: { background: '#ffffff', color: '#1e293b', },
                dark: { style: { background: '#1e293b', color: '#f8fafc', }, },
                success: { duration: 3000, iconTheme: { primary: '#22c55e', secondary: '#ffffff', }, },
                error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#ffffff', }, }
              }}
            />
          </TasksProvider>
        </AuthProvider>
      </ThemeProvider>
      {/* Ferramenta para depuração (opcional, mas recomendada) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    {/* -------------------- */}
  </StrictMode>,
);