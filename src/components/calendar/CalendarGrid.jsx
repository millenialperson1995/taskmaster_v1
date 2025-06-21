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

    // --- Layout de Grade para Desktop (sem alterações) ---
    const DesktopGrid = () => (
        <div className="hidden md:grid grid-cols-7 gap-1 mt-2">
            {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border rounded-md border-slate-200 dark:border-slate-800 h-32"></div>
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
                            {tasksForDay.slice(0, 3).map(task => (
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

    // --- Layout de Lista (Agenda) para Mobile (LÓGICA CORRIGIDA) ---
    const MobileAgenda = () => (
        <div className="block md:hidden mt-4 space-y-1">
            {daysInMonth.map(day => {
                const tasksForDay = getTasksForDay(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const dayOfWeek = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

                // A linha "if (tasksForDay.length === 0) return null;" FOI REMOVIDA
                // Agora todos os dias são renderizados

                return (
                    <div key={`mobile-${day.toString()}`} className={`p-2 rounded-lg flex items-start gap-3 ${isToday ? 'bg-white dark:bg-slate-800' : 'bg-transparent'}`}>
                        {/* Data e Dia da Semana */}
                        <div className={`text-center flex-shrink-0 w-12 ${isToday ? 'font-bold text-blue-600 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                            <div className="text-lg leading-tight">{day.getDate()}</div>
                            <div className="text-xs uppercase">{dayOfWeek}</div>
                        </div>

                        {/* Lista de Tarefas ou Mensagem de "Nenhuma tarefa" */}
                        <div className="flex-grow pt-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                            {tasksForDay.length > 0 ? (
                                <div className="space-y-2">
                                    {tasksForDay.map(task => (
                                        <div key={task.id} className="flex items-center gap-2 text-sm">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? 'bg-slate-400' : priorityColors[task.priority]}`}></div>
                                            <p className={`flex-grow ${task.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{task.text}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-400 dark:text-slate-500 italic h-full flex items-center">Nenhuma tarefa</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
    
    return (
        <>
            <DesktopGrid />
            <MobileAgenda />
        </>
    );
};