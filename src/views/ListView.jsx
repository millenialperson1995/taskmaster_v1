import { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskItem } from '../components/tasks/TaskItem';

export const ListView = () => {
  // Desestrutura os novos valores do hook
  const { tasks, categories, setPendingTasks, fetchMoreTasks, hasMoreTasks, isFetchingMore } = useTasks();

  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterPriority, setFilterPriority] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => filterCategory === 'Todos' || task.category === filterCategory)
      .filter(task => filterPriority === 'Todos' || task.priority === filterPriority)
      .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tasks, filterCategory, filterPriority, searchTerm]);

  const incompleteTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

  const dragItem = useRef();
  const dragOverItem = useRef();

  // A lógica de Drag and Drop não precisa de alterações
  const handleDragStart = (e, position) => { dragItem.current = position; };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  const handleDragEnd = () => {
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;
    const newTasks = [...incompleteTasks];
    const draggedItemContent = newTasks[dragItem.current];
    newTasks.splice(dragItem.current, 1);
    newTasks.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setPendingTasks(newTasks);
  };

  const filterInputClasses = "p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 w-full";

  return (
    <>
      <TaskForm />
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
        <div className="space-y-4"><AnimatePresence>{incompleteTasks.length > 0 ? incompleteTasks.map((task, index) => ( <motion.div key={task.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="cursor-grab active:cursor-grabbing"> <TaskItem task={task} /> </motion.div> )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma tarefa pendente. Hora de relaxar! 🏖️</p>} </AnimatePresence> </div>
        
        {/* Botão de Paginação */}
        {hasMoreTasks && (
            <div className="flex justify-center mt-6">
                <button 
                    onClick={fetchMoreTasks}
                    disabled={isFetchingMore}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                    {isFetchingMore ? 'Carregando...' : 'Carregar mais tarefas'}
                </button>
            </div>
        )}

        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-8 border-b border-slate-200 dark:border-slate-700 pb-2">Concluídas ({completedTasks.length})</h3>
        <div className="space-y-4"><AnimatePresence>{completedTasks.length > 0 ? completedTasks.map(task => ( <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}> <TaskItem task={task} /> </motion.div> )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma tarefa concluída ainda.</p>} </AnimatePresence></div>
      </div>
    </>
  );
};