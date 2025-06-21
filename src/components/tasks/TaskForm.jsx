import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const TaskForm = ({ initialData = {}, onCancel, onSaveCallback }) => {
  const { categories, addCategory, addTask } = useTasks();

  const [text, setText] = useState(initialData.text || '');
  const [category, setCategory] = useState(initialData.category || categories[0] || '');
  const [priority, setPriority] = useState(initialData.priority || 'Média');
  const [dueDate, setDueDate] = useState(initialData.dueDate?.split('T')[0] || '');
  const [reminderTime, setReminderTime] = useState(initialData.reminderTime || '');
  const [recurrence, setRecurrence] = useState(initialData.recurrence || 'none');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  // ADICIONADO: Pega a data de hoje no formato YYYY-MM-DD para usar no atributo 'min' do input
  const todayString = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const taskPayload = {
        ...initialData, text, category, priority, 
        dueDate: dueDate || null,
        reminderTime: dueDate ? reminderTime : '',
        recurrence: dueDate ? recurrence : 'none',
        completed: initialData.completed || false,
        subtasks: initialData.subtasks || []
    };

    if(onSaveCallback) {
        onSaveCallback(taskPayload);
    } else {
        addTask(taskPayload);
    }
    
    if (!initialData.id) {
      setText(''); setCategory(categories[0] || ''); setPriority('Média'); 
      setDueDate(''); setReminderTime(''); setRecurrence('none');
    }
  };

  const handleAddCategory = () => { 
    if (newCategory && !categories.includes(newCategory)) { 
      addCategory(newCategory); 
      setCategory(newCategory); 
      setNewCategory(''); 
      setIsAddingCategory(false); 
    } 
  };

  return (
    <Card className="p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">
          {initialData.id ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="O que precisa ser feito?" className="col-span-1 md:col-span-3" />
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Categoria</label>
            <div className="flex items-center gap-2">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Select>
              <Button type="button" variant="secondary" size="icon" onClick={() => setIsAddingCategory(!isAddingCategory)} className="p-2 aspect-square h-full">
                <Plus size={20} />
              </Button>
            </div>
            {isAddingCategory && (
              <div className="mt-2 flex gap-2">
                <Input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nova categoria" />
                <Button type="button" onClick={handleAddCategory} size="sm">Salvar</Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Prioridade</label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option>
            </Select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Data</label>
            {/* MODIFICADO: Adicionado o atributo 'min'
              - Se 'initialData.id' NÃO existir (criando tarefa), o 'min' é a data de hoje.
              - Se 'initialData.id' existir (editando tarefa), o 'min' não é aplicado (undefined).
            */}
            <Input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              min={!initialData.id ? todayString : undefined}
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Lembrete</label>
            <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} disabled={!dueDate} />
          </div>
          
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Recorrência</label>
            <Select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} disabled={!dueDate}>
              <option value="none">Nenhuma</option><option value="daily">Diária</option>
              <option value="weekly">Semanal</option><option value="monthly">Mensal</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
          <Button type="submit">
            <Save size={16} />
            {initialData.id ? 'Salvar Alterações' : 'Adicionar Tarefa'}
          </Button>
        </div>
      </form>
    </Card>
  );
};