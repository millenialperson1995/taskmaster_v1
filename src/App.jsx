import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, List, Trash2, Edit, Save, X, Tag, Flag, Clock, Moon, Sun, CheckSquare, Bell, ListChecks, Repeat, BarChart3, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Client, Account, Databases, ID, Query, AppwriteException } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('6856132d0011afe2210e');

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = '685629dd000a1c367c81'; // <-- PREENCHA AQUI com seu Database ID
const TASKS_COLLECTION_ID = '685629ff00005675ea41'; // <-- PREENCHA AQUI com seu Collection ID

// --- 2. COMPONENTES DA UI (Seus componentes originais, com uma pequena alteração no Navbar) ---

const Navbar = ({ theme, toggleTheme, onRequestNotificationPermission, notificationPermission, onLogout }) => (
  <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
    <div className="container mx-auto max-w-5xl px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-slate-800 dark:text-white">TaskMaster</span>
        </div>
        <div className="flex items-center gap-2">
           {notificationPermission !== 'granted' && (
             <button onClick={onRequestNotificationPermission} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" aria-label="Ativar notificações" title="Ativar notificações"><Bell size={22} /></button>
           )}
          <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          {/* Botão de Logout adicionado */}
          <button onClick={onLogout} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" aria-label="Sair" title="Sair">
             <LogOut size={22} />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const Header = ({ view, setView }) => (
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

const TaskForm = ({ onSave, initialData = {}, onCancel, categories, addCategory }) => {
  const [text, setText] = useState(initialData.text || '');
  const [category, setCategory] = useState(initialData.category || categories[0] || '');
  const [priority, setPriority] = useState(initialData.priority || 'Média');
  const [dueDate, setDueDate] = useState(initialData.dueDate || '');
  const [reminderTime, setReminderTime] = useState(initialData.reminderTime || '');
  const [recurrence, setRecurrence] = useState(initialData.recurrence || 'none');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({
      ...initialData, text, category, priority, dueDate: dueDate || null,
      reminderTime: dueDate ? reminderTime : '',
      recurrence: dueDate ? recurrence : 'none',
      completed: initialData.completed || false,
      subtasks: initialData.subtasks || []
    });
    if (!initialData.id) {
      setText(''); setCategory(categories[0] || ''); setPriority('Média'); setDueDate(''); setReminderTime(''); setRecurrence('none');
    }
  };

  const handleAddCategory = () => { if (newCategory && !categories.includes(newCategory)) { addCategory(newCategory); setCategory(newCategory); setNewCategory(''); setIsAddingCategory(false); } }
  const inputClasses = "p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full";

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm mb-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">{initialData.id ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="O que precisa ser feito?" className={`${inputClasses} col-span-1 md:col-span-3`} />
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Categoria</label>
          <div className="flex items-center gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
            <button type="button" onClick={() => setIsAddingCategory(!isAddingCategory)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition"><Plus size={20} /></button>
          </div>
          {isAddingCategory && (<div className="mt-2 flex gap-2"><input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nova categoria" className={inputClasses} /><button type="button" onClick={handleAddCategory} className="px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">Salvar</button></div>)}
        </div>
        <div className="flex flex-col"><label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Prioridade</label><select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClasses}><option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option></select></div>
        <div className="flex flex-col"><label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Data</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClasses} /></div>
        <div className="flex flex-col"><label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Lembrete</label><input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className={inputClasses} disabled={!dueDate} /></div>
        <div className="flex flex-col col-span-1 md:col-span-2"><label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Recorrência</label>
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className={inputClasses} disabled={!dueDate}>
            <option value="none">Nenhuma</option><option value="daily">Diária</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition">Cancelar</button>}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"><Save size={16} />{initialData.id ? 'Salvar Alterações' : 'Adicionar Tarefa'}</button>
      </div>
    </form>
  );
};

const SubtaskList = ({ task, onUpdate }) => {
  const [subtaskText, setSubtaskText] = useState('');
  const handleAddSubtask = (e) => { e.preventDefault(); if (!subtaskText.trim()) return; onUpdate({ ...task, subtasks: [...task.subtasks, { id: Date.now(), text: subtaskText, completed: false }] }); setSubtaskText(''); };
  const handleToggleSubtask = (subtaskId) => { onUpdate({ ...task, subtasks: task.subtasks.map(sub => sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub) }); };
  const handleDeleteSubtask = (subtaskId) => { onUpdate({ ...task, subtasks: task.subtasks.filter(sub => sub.id !== subtaskId) }); };
  const completedCount = task.subtasks.filter(s => s.completed).length;
  const totalCount = task.subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return (
    <div className="pl-8 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
      {totalCount > 0 && (<div className="mb-3"><div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1"><span>Progresso</span><span>{Math.round(progress)}%</span></div><div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div></div>)}
      <div className="space-y-2">{task.subtasks.map(subtask => (<div key={subtask.id} className="flex items-center gap-3 group"><input type="checkbox" checked={subtask.completed} onChange={() => handleToggleSubtask(subtask.id)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 bg-slate-100 dark:bg-slate-900 focus:ring-blue-500 cursor-pointer"/><span className={`flex-grow text-sm ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{subtask.text}</span><button onClick={() => handleDeleteSubtask(subtask.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"><X size={16} /></button></div>))}</div>
      <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2"><input type="text" value={subtaskText} onChange={(e) => setSubtaskText(e.target.value)} placeholder="Adicionar subtarefa..." className="p-1.5 flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm" /><button type="submit" className="px-3 bg-slate-200 dark:bg-slate-600 text-sm font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Add</button></form>
    </div>
  );
};

const TaskItem = ({ task, onUpdate, onDelete, onToggleComplete, categories, addCategory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const priorityConfig = { 'Alta': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300' }, 'Média': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300' }, 'Baixa': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300' } };
  const { bg, text } = priorityConfig[task.priority] || priorityConfig['Média'];
  const handleSave = (updatedTask) => { onUpdate(updatedTask); setIsEditing(false); };
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  const subtaskCount = task.subtasks?.length || 0;
  const completedSubtaskCount = task.subtasks?.filter(s => s.completed).length || 0;
  const isRecurring = task.recurrence && task.recurrence !== 'none';
  if (isEditing) { return <TaskForm initialData={task} onSave={handleSave} onCancel={() => setIsEditing(false)} categories={categories} addCategory={addCategory}/>; }
  return (
    <div className={`p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm transition-all duration-300 ${task.completed ? 'opacity-60' : ''} border-l-4 ${isOverdue ? 'border-red-500' : 'border-transparent dark:border-slate-800'}`}>
      <div className="flex items-start gap-4">
        <div className="mt-1 flex items-center justify-center h-5 w-5">{ isRecurring ? (<Repeat size={16} className="text-purple-500" title={`Esta tarefa repete-se ${task.recurrence === 'daily' ? 'diariamente' : task.recurrence === 'weekly' ? 'semanalmente' : 'mensalmente'}`} />) : (<input type="checkbox" checked={task.completed} onChange={() => onToggleComplete(task.id)} className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 bg-slate-100 dark:bg-slate-900 focus:ring-blue-500 cursor-pointer" />) }</div>
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
            <button onClick={() => onDelete(task.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><Trash2 size={18} /></button>
        </div>
      </div>
      {showSubtasks && <SubtaskList task={task} onUpdate={onUpdate} />}
    </div>
  );
};

const ListView = ({ tasks, categories, addTask, addCategory, updateTask, deleteTask, toggleComplete, setPendingTasks }) => {
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterPriority, setFilterPriority] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTasks = useMemo(() => { return tasks.filter(task => filterCategory === 'Todos' || task.category === filterCategory).filter(task => filterPriority === 'Todos' || task.priority === filterPriority).filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase())); }, [tasks, filterCategory, filterPriority, searchTerm]);
  const incompleteTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);
  const dragItem = useRef();
  const dragOverItem = useRef();
  const handleDragStart = (e, position) => { dragItem.current = position; };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  const handleDragEnd = () => { if (dragItem.current === undefined || dragOverItem.current === undefined) return; const newTasks = [...incompleteTasks]; const draggedItemContent = newTasks[dragItem.current]; newTasks.splice(dragItem.current, 1); newTasks.splice(dragOverItem.current, 0, draggedItemContent); dragItem.current = null; dragOverItem.current = null; setPendingTasks(newTasks); };
  const filterInputClasses = "p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 w-full";
  return (
    <>
      <TaskForm onSave={addTask} categories={categories} addCategory={addCategory}/>
      <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm mb-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Pesquisar tarefas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={filterInputClasses}/>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={filterInputClasses}><option value="Todos">Todas as Categorias</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={filterInputClasses}><option value="Todos">Todas as Prioridades</option><option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option></select>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-6 border-b border-slate-200 dark:border-slate-700 pb-2">Pendentes ({incompleteTasks.length})</h3>
        <div className="space-y-4"><AnimatePresence>{incompleteTasks.length > 0 ? incompleteTasks.map((task, index) => ( <motion.div key={task.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="cursor-grab active:cursor-grabbing"> <TaskItem task={task} onUpdate={updateTask} onDelete={deleteTask} onToggleComplete={toggleComplete} categories={categories} addCategory={addCategory} /> </motion.div> )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma tarefa pendente. Hora de relaxar! 🏖️</p>} </AnimatePresence> </div>
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-8 border-b border-slate-200 dark:border-slate-700 pb-2">Concluídas ({completedTasks.length})</h3>
        <div className="space-y-4"><AnimatePresence>{completedTasks.length > 0 ? completedTasks.map(task => ( <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}> <TaskItem task={task} onUpdate={updateTask} onDelete={deleteTask} onToggleComplete={toggleComplete} categories={categories} addCategory={addCategory}/> </motion.div> )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma tarefa concluída ainda.</p>} </AnimatePresence></div>
      </div>
    </>
  );
};

const CalendarView = ({ tasks }) => {
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
              // Compara ano, mês e dia em UTC para evitar problemas de fuso horário
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

const DashboardView = ({ tasks, theme }) => {
    const data = useMemo(() => {
        const completedTasks = tasks.filter(t => t.completed && t.completionDate);
        const categoryCounts = completedTasks.reduce((acc, task) => { acc[task.category] = (acc[task.category] || 0) + 1; return acc; }, {});
        const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
        const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }).reverse();
        const barData = last7Days.map(day => { const count = completedTasks.filter(t => t.completionDate && t.completionDate.startsWith(day)).length; const date = new Date(day + "T00:00:00"); return { name: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }), Tarefas: count }; });
        const totalCompleted = completedTasks.length;
        const mostProductiveCategory = pieData.length > 0 ? pieData.reduce((max, cat) => cat.value > max.value ? cat : max).name : 'N/A';
        const daysWithTasks = new Set(completedTasks.map(t => t.completionDate.split('T')[0])).size;
        const dailyAverage = daysWithTasks > 0 ? (totalCompleted / daysWithTasks).toFixed(1) : 0;
        return { pieData, barData, totalCompleted, mostProductiveCategory, dailyAverage };
    }, [tasks]);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
    const isDark = theme === 'dark';
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm"><h3 className="text-slate-500 dark:text-slate-400">Total Concluídas</h3><p className="text-4xl font-bold text-slate-800 dark:text-white">{data.totalCompleted}</p></div>
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm"><h3 className="text-slate-500 dark:text-slate-400">Média Diária</h3><p className="text-4xl font-bold text-slate-800 dark:text-white">{data.dailyAverage}</p></div>
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm"><h3 className="text-slate-500 dark:text-slate-400">Categoria Principal</h3><p className="text-4xl font-bold text-slate-800 dark:text-white truncate">{data.mostProductiveCategory}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-200">Atividade nos Últimos 7 Dias</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={data.barData}><XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} /><YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#334155' : '#fff', border: '1px solid #334155' }} cursor={{ fill: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)' }}/><Bar dataKey="Tarefas" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-200">Tarefas por Categoria</h3>
                    <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{data.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: isDark ? '#334155' : '#fff', border: '1px solid #334155' }} /><Legend /></PieChart></ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- 3. COMPONENTES DE AUTENTICAÇÃO ---

const AuthFormContainer = ({ title, children, error, onSubmit }) => (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
             <div className="flex items-center justify-center gap-3 mb-8">
                <CheckSquare className="h-10 w-10 text-blue-600" />
                <span className="text-4xl font-bold text-slate-800 dark:text-white">TaskMaster</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-6">{title}</h2>
                {error && <p className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-center mb-4 text-sm">{error}</p>}
                <form onSubmit={onSubmit} className="space-y-4">
                    {children}
                </form>
            </div>
        </div>
    </div>
);

const LoginPage = ({ setAuthView, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await account.createEmailPasswordSession(email, password);
            onLoginSuccess();
        } catch (err) {
            setError('Falha ao fazer login. Verifique seu e-mail e senha.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Acessar sua conta" error={error} onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">{loading ? "Entrando..." : "Entrar"}</button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => setAuthView('signup')} className="font-semibold text-blue-600 hover:underline">Cadastre-se</button>
            </p>
        </AuthFormContainer>
    );
};

const SignupPage = ({ setAuthView, onSignupSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await account.create(ID.unique(), email, password, name);
            // Após o cadastro, faz o login automaticamente
            await account.createEmailPasswordSession(email, password);
            onSignupSuccess();
        } catch (err) {
            setError('Falha ao criar conta. O e-mail pode já estar em uso.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Crie sua conta" error={error} onSubmit={handleSubmit}>
            <input type="text" placeholder="Seu Nome" value={name} onChange={e => setName(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <input type="password" placeholder="Senha (mín. 8 caracteres)" value={password} onChange={e => setPassword(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">{loading ? "Criando..." : "Criar Conta"}</button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Já tem uma conta?{' '}
                <button type="button" onClick={() => setAuthView('login')} className="font-semibold text-blue-600 hover:underline">Faça login</button>
            </p>
        </AuthFormContainer>
    );
};

// --- 4. COMPONENTE DA APLICAÇÃO PRINCIPAL (Visível apenas quando logado) ---

function TaskMaster({ user, onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [categories, setCategories] = useState(['Trabalho', 'Pessoal', 'Estudos']);
    const [view, setView] = useState('list');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [notificationPermission, setNotificationPermission] = useState('default');

    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const prefs = await account.getPrefs();
                if (prefs.categories && prefs.categories.length > 0) {
                    setCategories(prefs.categories);
                }
            } catch (e) { console.error("Falha ao buscar preferências de usuário", e); }
        };

        const fetchTasks = async () => {
            setLoadingTasks(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_COLLECTION_ID,
                    [Query.equal('userId', user.$id), Query.orderDesc('$createdAt')]
                );
                const loadedTasks = response.documents.map(doc => ({
                    ...doc,
                    id: doc.$id,
                    subtasks: doc.subtasks ? JSON.parse(doc.subtasks) : [],
                }));
                setTasks(loadedTasks);
            } catch (error) {
                console.error("Falha ao buscar tarefas:", error);
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchUserPreferences();
        fetchTasks();
    }, [user]);

    useEffect(() => { if (theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); localStorage.setItem('theme', theme); }, [theme]);
    useEffect(() => { if ("Notification" in window) { setNotificationPermission(Notification.permission); } }, []);
    
    // --- FUNÇÕES CRUD COM APPWRITE (CORRIGIDAS) ---
    const addTask = async (taskData) => {
        try {
            const payload = {
                userId: user.$id,
                text: taskData.text,
                category: taskData.category,
                priority: taskData.priority,
                dueDate: taskData.dueDate || null, // <-- CORREÇÃO APLICADA
                reminderTime: taskData.reminderTime || null,
                recurrence: taskData.recurrence,
                completed: false,
                subtasks: JSON.stringify(taskData.subtasks || []),
            };
            const response = await databases.createDocument(DATABASE_ID, TASKS_COLLECTION_ID, ID.unique(), payload);
            const newTask = { ...response, id: response.$id, subtasks: JSON.parse(response.subtasks || '[]'), };
            setTasks([newTask, ...tasks]);
        } catch (error) { console.error("Falha ao adicionar tarefa:", error); }
    };

    const updateTask = async (updatedTaskData) => {
        try {
            const { id, ...data } = updatedTaskData;
            const payload = { ...data };
            ['$collectionId', '$databaseId', '$createdAt', '$updatedAt', '$permissions'].forEach(key => delete payload[key]);
            
            // <-- CORREÇÃO APLICADA AQUI
            payload.dueDate = payload.dueDate || null;
            payload.completionDate = payload.completionDate || null;
            
            payload.subtasks = JSON.stringify(payload.subtasks || '[]');

            await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, id, payload);
            setTasks(tasks.map(t => (t.id === id ? updatedTaskData : t)));
        } catch (error) { console.error("Falha ao atualizar tarefa:", error); }
    };
    
    const deleteTask = async (id) => {
        try {
            await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) { console.error("Falha ao deletar tarefa:", error); }
    };

    const toggleComplete = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newCompletedStatus = !task.completed;
        const updatedTask = { ...task, completed: newCompletedStatus, completionDate: newCompletedStatus ? new Date().toISOString() : null };
        updateTask(updatedTask);
    };

    const addCategory = async (cat) => {
        if (cat && !categories.includes(cat)) {
            const newCategories = [...categories, cat];
            setCategories(newCategories);
            try { await account.updatePrefs({ categories: newCategories }); }
            catch (e) { console.error("Falha ao salvar categoria", e); }
        }
    };
    
    const setPendingTasks = (newPendingTasks) => {
      const completedTasks = tasks.filter(t => t.completed);
      setTasks([...newPendingTasks, ...completedTasks]);
    }
    
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const requestNotificationPermission = () => Notification.requestPermission().then(setNotificationPermission);

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Navbar theme={theme} toggleTheme={toggleTheme} onRequestNotificationPermission={requestNotificationPermission} notificationPermission={notificationPermission} onLogout={onLogout} />
            <main className="container mx-auto p-4 max-w-5xl">
                <Header view={view} setView={setView} />
                {loadingTasks ? (
                    <div className="text-center py-10">Carregando suas tarefas...</div>
                ) : (
                    <>
                        {view === 'list' && <ListView tasks={tasks} categories={categories} addTask={addTask} addCategory={addCategory} updateTask={updateTask} deleteTask={deleteTask} toggleComplete={toggleComplete} setPendingTasks={setPendingTasks} />}
                        {view === 'calendar' && <CalendarView tasks={tasks} />}
                        {view === 'dashboard' && <DashboardView tasks={tasks} theme={theme} />}
                    </>
                )}
            </main>
        </div>
    );
}

// --- 5. COMPONENTE PRINCIPAL E "ROTEADOR" DE AUTENTICAÇÃO ---

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authView, setAuthView] = useState('login'); // 'login' ou 'signup'

    useEffect(() => {
        const checkSession = async () => {
            try {
                const user = await account.get();
                setCurrentUser(user);
            } catch (e) {
                if (e instanceof AppwriteException && e.code !== 401) {
                    console.error("Erro ao verificar sessão:", e);
                }
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const handleLoginSuccess = async () => {
        setIsLoading(true);
        try {
            const user = await account.get();
            setCurrentUser(user);
        } catch (e) {
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await account.deleteSession('current');
        setCurrentUser(null);
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center items-center"><p className="text-slate-600 dark:text-slate-400">Carregando aplicação...</p></div>;
    }

    if (currentUser) {
        return <TaskMaster user={currentUser} onLogout={handleLogout} />;
    }

    return authView === 'login' 
        ? <LoginPage setAuthView={setAuthView} onLoginSuccess={handleLoginSuccess} /> 
        : <SignupPage setAuthView={setAuthView} onSignupSuccess={handleLoginSuccess} />;
}