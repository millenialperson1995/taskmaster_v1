import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';

export const TaskForm = ({ initialData = {}, onCancel, onSaveCallback }) => {
  const { categories, addCategory, addTask } = useTasks();

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

    const taskPayload = {
        ...initialData, 
        text, 
        category, 
        priority, 
        dueDate: dueDate || null,
        reminderTime: dueDate ? reminderTime : '',
        recurrence: dueDate ? recurrence : 'none',
        completed: initialData.completed || false,
        subtasks: initialData.subtasks || []
    };

    if(onSaveCallback) {
        onSaveCallback(taskPayload)
    } else {
        addTask(taskPayload)
    }
    
    if (!initialData.id) {
      setText(''); 
      setCategory(categories[0] || ''); 
      setPriority('Média'); 
      setDueDate(''); 
      setReminderTime(''); 
      setRecurrence('none');
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