import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView = () => {
    const { tasks } = useTasks();
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    
    const priorityColors = { Alta: 'bg-red-500', Média: 'bg-yellow-500', Baixa: 'bg-green-500' };
    
    return (
      <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><ChevronLeft /></button><h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><ChevronRight /></button></div>
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-slate-600 dark:text-slate-400">{daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="border rounded-md border-slate-100 dark:border-slate-800"></div>)}
          {daysInMonth.map(day => {
            const tasksForDay = tasks.filter(task => {
              if (!task.dueDate) return false;
              const taskDate = new Date(task.dueDate);
              return taskDate.getUTCFullYear() === day.getFullYear() &&
                     taskDate.getUTCMonth() === day.getMonth() &&
                     taskDate.getUTCDate() === day.getDate();
            });
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={day.toString()} className={`border rounded-md p-2 h-32 flex flex-col ${isToday ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <span className={`font-semibold ${isToday ? 'text-blue-600 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{day.getDate()}</span>
                <div className="mt-1 space-y-1 overflow-y-auto text-left scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">{tasksForDay.map(task => (<div key={task.id} title={task.text} className={`flex items-center gap-1 text-xs text-white p-1 rounded ${task.completed ? 'bg-slate-400 dark:bg-slate-600' : (priorityColors[task.priority] || 'bg-slate-500')}`}><p className={`flex-grow truncate ${task.completed ? 'line-through' : ''}`}>{task.text}</p></div>))}</div>
              </div>);
          })}
        </div>
      </div>
    );
};