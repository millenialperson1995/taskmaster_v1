import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';

export const TaskFilters = () => {
  const { 
    categories,
    searchTerm, 
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority
  } = useTasks();

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">Filtros</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Input 
          type="text" 
          placeholder="Pesquisar tarefas..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="Todos">Todas as Categorias</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
        <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="Todos">Todas as Prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </Select>
      </div>
    </Card>
  );
};