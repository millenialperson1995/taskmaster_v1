import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { useTasks } from '../../hooks/useTasks';

export const TaskList = ({ tasks, type, title, emptyMessage }) => {
  const { setPendingTasks } = useTasks();

  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, position) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;
    const newTasks = [...tasks];
    const draggedItemContent = newTasks[dragItem.current];
    newTasks.splice(dragItem.current, 1);
    newTasks.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = undefined;
    dragOverItem.current = undefined;
    
    if (type === 'pending') {
      setPendingTasks(newTasks);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-6 border-b border-slate-200 dark:border-slate-700 pb-2">
        {title} ({tasks.length})
      </h3>
      <div className="space-y-4">
        <AnimatePresence>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: type === 'pending' ? -50 : 50, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                draggable={type === 'pending'}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={type === 'pending' ? 'cursor-grab active:cursor-grabbing' : ''}
              >
                <TaskItem task={task} />
              </motion.div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">{emptyMessage}</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};