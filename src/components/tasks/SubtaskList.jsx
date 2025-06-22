import { useState } from 'react';
import { X } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';

export const SubtaskList = ({ task }) => {
  const { updateTask } = useTasks();
  const [subtaskText, setSubtaskText] = useState('');

  const handleUpdate = (updatedTask) => {
    updateTask(updatedTask);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!subtaskText.trim()) return;
    handleUpdate({
      ...task,
      subtasks: [...task.subtasks, { id: Date.now(), text: subtaskText, completed: false }]
    });
    setSubtaskText('');
  };

  const handleToggleSubtask = (subtaskId) => {
    handleUpdate({
      ...task,
      subtasks: task.subtasks.map(sub =>
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
      )
    });
  };

  const handleDeleteSubtask = (subtaskId) => {
    handleUpdate({
      ...task,
      subtasks: task.subtasks.filter(sub => sub.id !== subtaskId)
    });
  };

  const completedCount = task.subtasks.filter(s => s.completed).length;
  const totalCount = task.subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="pl-8 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
      {totalCount > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {task.subtasks.map(subtask => (
          <div key={subtask.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() => handleToggleSubtask(subtask.id)}
              className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 bg-slate-100 dark:bg-slate-900 focus:ring-blue-500 cursor-pointer"
            />
            <span
              className={`flex-grow text-sm ${
                subtask.completed
                  ? 'line-through text-slate-500'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {subtask.text}
            </span>
            {/* --- ALTERAÇÃO APLICADA AQUI --- */}
            <button
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="transition-opacity text-slate-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
        <input
          type="text"
          value={subtaskText}
          onChange={(e) => setSubtaskText(e.target.value)}
          placeholder="Adicionar subtarefa..."
          className="p-1.5 flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
        />
        <button
          type="submit"
          className="px-3 bg-slate-200 dark:bg-slate-600 text-sm font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"
        >
          Add
        </button>
      </form>
    </div>
  );
};