import { List, Calendar, BarChart3 } from 'lucide-react';

export const Header = ({ view, setView }) => (
  <header className="text-center my-8">
    <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">Organize seu dia, conquiste suas metas.</h1>
    <p className="text-slate-500 dark:text-slate-400">Escolha como visualizar suas tarefas.</p>
    <div className="mt-6 flex justify-center bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-fit mx-auto">
      <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${view === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}><List className="mr-2 h-4 w-4" />Lista</button>
      <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${view === 'calendar' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}><Calendar className="mr-2 h-4 w-4" />Calendário</button>
      <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${view === 'dashboard' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}><BarChart3 className="mr-2 h-4 w-4" />Dashboard</button>
    </div>
  </header>
);