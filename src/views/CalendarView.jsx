import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CalendarGrid } from '../components/calendar/CalendarGrid';

export const CalendarView = () => {
    const { tasks } = useTasks();
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    
    return (
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
            <Button onClick={() => changeMonth(-1)} variant="ghost" size="icon">
                <ChevronLeft />
            </Button>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <Button onClick={() => changeMonth(1)} variant="ghost" size="icon">
                <ChevronRight />
            </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-slate-600 dark:text-slate-400">
            {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
        </div>
        <CalendarGrid 
            daysInMonth={daysInMonth}
            startDay={startDay}
            tasks={tasks}
        />
      </Card>
    );
};