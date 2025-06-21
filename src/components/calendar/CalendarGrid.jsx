import React from 'react';

export const CalendarGrid = ({ daysInMonth, startDay, tasks }) => {
    const priorityColors = { Alta: 'bg-red-500', Média: 'bg-yellow-500', Baixa: 'bg-green-500' };

    const getTasksForDay = (day) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.getUTCFullYear() === day.getFullYear() &&
                   taskDate.getUTCMonth() === day.getMonth() &&
                   taskDate.getUTCDate() === day.getDate();
        });
    };

    return (
        <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border rounded-md border-slate-100 dark:border-slate-800"></div>
            ))}
            {daysInMonth.map(day => {
                const tasksForDay = getTasksForDay(day);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                    <div 
                        key={day.toString()} 
                        className={`border rounded-md p-2 h-32 flex flex-col ${isToday ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                    >
                        <span className={`font-semibold ${isToday ? 'text-blue-600 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-1 overflow-y-auto text-left scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                            {tasksForDay.map(task => (
                                <div 
                                    key={task.id} 
                                    title={task.text} 
                                    className={`flex items-center gap-1 text-xs text-white p-1 rounded ${task.completed ? 'bg-slate-400 dark:bg-slate-600' : (priorityColors[task.priority] || 'bg-slate-500')}`}
                                >
                                    <p className={`flex-grow truncate ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};