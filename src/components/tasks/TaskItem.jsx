import React, { useState, memo } from 'react';
import { Trash2, Edit, ListChecks, Repeat, Flag, Clock, Bell, Tag } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { TaskForm } from './TaskForm';
import { SubtaskList } from './SubtaskList';

const TaskItemComponent = ({ task }) => {
  const { updateTask, deleteTask, toggleComplete } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const priorityConfig = { 'Alta': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300' }, 'Média': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300' }, 'Baixa': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300' } };
  const { bg, text } = priorityConfig[task.priority] || priorityConfig['Média'];
  
  const handleSave = (updatedTask) => { 
    updateTask(updatedTask); 
    setIsEditing(false); 
  };
  
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  const subtaskCount = task.subtasks?.length || 0;
  const completedSubtaskCount = task.subtasks?.filter(s => s.completed).length || 0;
  const isRecurring = task.recurrence && task.recurrence !== 'none';
  
  if (isEditing) { 
    return <TaskForm initialData={task} onSaveCallback={handleSave} onCancel={() => setIsEditing(false)} />; 
  }

  return (
    <div className={`p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm transition-all duration-300 ${task.completed ? 'opacity-60' : ''} border-l-4 ${isOverdue ? 'border-red-500' : 'border-transparent dark:border-slate-800'}`}>
      <div className="flex items-start gap-4">
        {/* Lógica do checkbox foi ajustada para passar a task inteira */}
        <div className="mt-1 flex items-center justify-center h-5 w-5">{ isRecurring ? (<Repeat size={16} className="text-purple-500" title={`Esta tarefa repete-se ${task.recurrence === 'daily' ? 'diariamente' : task.recurrence === 'weekly' ? 'semanalmente' : 'mensalmente'}`} />) : (<input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 bg-slate-100 dark:bg-slate-900 focus:ring-blue-500 cursor-pointer" />) }</div>
        <div className="flex-grow">
          <p className={`text-slate-800 dark:text-slate-200 ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1"><Tag size={14} /> {task.category}</span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}><Flag size={14} />{task.priority}</span>
            {task.dueDate && <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}><Clock size={14} /> {new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>}
            {task.reminderTime && task.dueDate && <span className="flex items-center gap-1 text-blue-500"><Bell size={14}/> {task.reminderTime}</span>}
            {isRecurring && <span className="flex items-center gap-1 text-purple-500"><Repeat size={14}/> {task.recurrence === 'daily' ? 'Diária' : task.recurrence === 'weekly' ? 'Semanal' : 'Mensal'}</span>}
            {subtaskCount > 0 && <span className="flex items-center gap-1"><ListChecks size={14}/> {completedSubtaskCount}/{subtaskCount}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setShowSubtasks(!showSubtasks)} className={`p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition ${showSubtasks ? 'bg-slate-200 dark:bg-slate-700' : ''}`}><ListChecks size={18} /></button>
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><Edit size={18} /></button>
            <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><Trash2 size={18} /></button>
        </div>
      </div>
      {showSubtasks && <SubtaskList task={task} />}
    </div>
  );
};

export const TaskItem = memo(TaskItemComponent);