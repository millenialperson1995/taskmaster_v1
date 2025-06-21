import { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTheme } from '../hooks/useTheme';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const DashboardView = () => {
    const { tasks } = useTasks();
    const { theme } = useTheme();

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