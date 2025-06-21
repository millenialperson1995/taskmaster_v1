import { useEffect, useRef } from "react";
import { useTasks } from "./useTasks";

export const useNotificationScheduler = () => {
  const { tasks } = useTasks();
  const scheduledNotifications = useRef(new Map());

  useEffect(() => {
    // Limpa todos os timeouts agendados anteriormente para evitar duplicatas
    for (const timeoutId of scheduledNotifications.current.values()) {
      clearTimeout(timeoutId);
    }
    scheduledNotifications.current.clear();

    // Se a permissão não foi concedida, não faz nada
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      return;
    }

    // Itera sobre as tarefas para agendar novas notificações
    tasks.forEach((task) => {
      // Agenda apenas para tarefas não concluídas com data e hora de lembrete
      if (!task.completed && task.dueDate && task.reminderTime) {
        const [hours, minutes] = task.reminderTime.split(":");

        // Cria a data do lembrete a partir da data da tarefa (que é UTC)
        const reminderDate = new Date(task.dueDate);
        reminderDate.setUTCHours(Number(hours), Number(minutes), 0, 0);

        const delay = reminderDate.getTime() - new Date().getTime();

        // Se a data do lembrete ainda está no futuro
        if (delay > 0) {
          const timeoutId = setTimeout(() => {
            // Cria a notificação
            new Notification("Lembrete de Tarefa - TaskMaster", {
              body: task.text,
              icon: "/pwa-192x192.png", // Ícone da notificação
              badge: "/checklist.svg", // Ícone pequeno para a barra de status (Android)
              tag: task.id, // Agrupa notificações da mesma tarefa
            });
          }, delay);

          // Armazena a referência do timeout para poder limpar depois
          scheduledNotifications.current.set(task.id, timeoutId);
        }
      }
    });

    // Função de limpeza que será executada quando o componente desmontar ou as tarefas mudarem
    return () => {
      for (const timeoutId of scheduledNotifications.current.values()) {
        clearTimeout(timeoutId);
      }
    };
  }, [tasks]); // O efeito roda novamente sempre que a lista de tarefas mudar
};
