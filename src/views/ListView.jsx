import { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskList } from '../components/tasks/TaskList';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { Button } from '../components/ui/Button';

export const ListView = () => {
  // O hook 'useTasks' agora retorna os valores do React Query
  const { 
    filteredTasks, 
    hasMoreTasks, 
    fetchMoreTasks, 
    isFetchingMore 
  } = useTasks();

  const incompleteTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

  return (
    <>
      <TaskForm />
      
      <TaskFilters />

      <div className="space-y-4">
        <TaskList
          tasks={incompleteTasks}
          type="pending"
          title="Pendentes"
          emptyMessage="Nenhuma tarefa pendente. Hora de relaxar! 🏖️"
        />
        
        {hasMoreTasks && (
            <div className="flex justify-center mt-6">
                <Button 
                    onClick={() => fetchMoreTasks()}
                    disabled={isFetchingMore}
                    variant="primary"
                    size="md"
                >
                    {isFetchingMore ? 'Carregando...' : 'Carregar mais tarefas'}
                </Button>
            </div>
        )}

        <TaskList
          tasks={completedTasks}
          type="completed"
          title="Concluídas"
          emptyMessage="Nenhuma tarefa concluída ainda."
        />
      </div>
    </>
  );
};