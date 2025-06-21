import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { Navbar } from './components/layout/Navbar';
import { Header } from './components/layout/Header';
import { ListView } from './views/ListView';
import { CalendarView } from './views/CalendarView';
import { DashboardView } from './views/DashboardView';

function TaskMasterApp() {
    // ALTERADO: de loadingTasks para isLoading
    const { isLoading } = useTasks();
    const [view, setView] = useState('list');
    const [notificationPermission, setNotificationPermission] = useState('default');

    useEffect(() => {
        if ("Notification" in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const requestNotificationPermission = () => {
        Notification.requestPermission().then(setNotificationPermission);
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Navbar 
                onRequestNotificationPermission={requestNotificationPermission} 
                notificationPermission={notificationPermission}
            />
            <main className="container mx-auto p-4 max-w-5xl">
                <Header view={view} setView={setView} />
                {/* ALTERADO: de loadingTasks para isLoading */}
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">Carregando suas tarefas...</div>
                ) : (
                    <>
                        {view === 'list' && <ListView />}
                        {view === 'calendar' && <CalendarView />}
                        {view === 'dashboard' && <DashboardView />}
                    </>
                )}
            </main>
        </div>
    );
}

export default function App() {
    const { currentUser, isLoading } = useAuth();
    const [authView, setAuthView] = useState('login'); 

    if (isLoading) {
        return <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center items-center"><p className="text-slate-600 dark:text-slate-400">Carregando aplicação...</p></div>;
    }

    if (currentUser) {
        return <TaskMasterApp />;
    }

    return authView === 'login' 
        ? <LoginPage setAuthView={setAuthView} /> 
        : <SignupPage setAuthView={setAuthView} />;
}