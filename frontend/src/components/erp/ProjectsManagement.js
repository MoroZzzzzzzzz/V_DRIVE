import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    color: '#D4AF37'
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    due_date: ''
  });

  // Mock projects data
  const mockProjects = [
    {
      id: '1',
      name: 'Запуск BMW X5',
      description: 'Подготовка к продаже новой модели BMW X5',
      color: '#3B82F6',
      created_at: '2024-01-10T00:00:00Z',
      tasks: {
        todo: [
          {
            id: 't1',
            title: 'Фотосессия автомобиля',
            description: 'Профессиональные фото для каталога',
            assignee: 'Иван Петров',
            priority: 'high',
            due_date: '2024-01-20',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 't2',
            title: 'Подготовить описание',
            description: 'Техническое описание и комплектации',
            assignee: 'Анна Смирнова',
            priority: 'medium',
            due_date: '2024-01-18',
            created_at: '2024-01-15T11:00:00Z'
          }
        ],
        in_progress: [
          {
            id: 't3',
            title: 'Настройка цены',
            description: 'Анализ рынка и установка конкурентной цены',
            assignee: 'Максим Козлов',
            priority: 'high',
            due_date: '2024-01-17',
            created_at: '2024-01-14T15:30:00Z'
          }
        ],
        done: [
          {
            id: 't4',
            title: 'Получение автомобиля',
            description: 'Доставка от поставщика',
            assignee: 'Сергей Волков',
            priority: 'high',
            due_date: '2024-01-15',
            created_at: '2024-01-10T09:00:00Z'
          }
        ]
      }
    },
    {
      id: '2',
      name: 'Маркетинг Mercedes-Benz',
      description: 'Рекламная кампания для премиум линейки',
      color: '#10B981',
      created_at: '2024-01-12T00:00:00Z',
      tasks: {
        todo: [
          {
            id: 't5',
            title: 'Разработка креативов',
            description: 'Создание рекламных материалов',
            assignee: 'Елена Новикова',
            priority: 'medium',
            due_date: '2024-01-25',
            created_at: '2024-01-16T14:00:00Z'
          }
        ],
        in_progress: [],
        done: []
      }
    }
  ];

  useEffect(() => {
    setProjects(mockProjects);
    if (mockProjects.length > 0) {
      setSelectedProject(mockProjects[0]);
    }
  }, []);

  const handleCreateProject = (e) => {
    e.preventDefault();
    
    const newProject = {
      id: Date.now().toString(),
      ...projectForm,
      created_at: new Date().toISOString(),
      tasks: { todo: [], in_progress: [], done: [] }
    };
    
    setProjects(prev => [...prev, newProject]);
    setSelectedProject(newProject);
    setShowProjectModal(false);
    setProjectForm({ name: '', description: '', color: '#D4AF37' });
    toast.success('Проект создан');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    
    if (!selectedProject) return;
    
    const newTask = {
      id: 't' + Date.now(),
      ...taskForm,
      created_at: new Date().toISOString()
    };
    
    setProjects(prev => prev.map(project => 
      project.id === selectedProject.id 
        ? {
            ...project,
            tasks: {
              ...project.tasks,
              todo: [...project.tasks.todo, newTask]
            }
          }
        : project
    ));
    
    setSelectedProject(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        todo: [...prev.tasks.todo, newTask]
      }
    }));
    
    setShowTaskModal(false);
    setTaskForm({ title: '', description: '', assignee: '', priority: 'medium', due_date: '' });
    toast.success('Задача добавлена');
  };

  const moveTask = (taskId, fromColumn, toColumn) => {
    if (!selectedProject) return;
    
    const task = selectedProject.tasks[fromColumn].find(t => t.id === taskId);
    if (!task) return;
    
    const updatedProject = {
      ...selectedProject,
      tasks: {
        ...selectedProject.tasks,
        [fromColumn]: selectedProject.tasks[fromColumn].filter(t => t.id !== taskId),
        [toColumn]: [...selectedProject.tasks[toColumn], task]
      }
    };
    
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    ));
    
    setSelectedProject(updatedProject);
    toast.success('Задача перемещена');
  };

  const handleDragStart = (e, task, column) => {
    setDraggedTask({ task, column });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.column !== targetColumn) {
      moveTask(draggedTask.task.id, draggedTask.column, targetColumn);
    }
    
    setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-black';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Обычный';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const columns = [
    { id: 'todo', title: 'К выполнению', icon: 'fas fa-list-ul' },
    { id: 'in_progress', title: 'В работе', icon: 'fas fa-play' },
    { id: 'done', title: 'Выполнено', icon: 'fas fa-check' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление проектами</h2>
          <p className="text-gray-400">
            {selectedProject ? `Проект: ${selectedProject.name}` : 'Выберите проект'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowTaskModal(true)}
            disabled={!selectedProject}
            className="btn-outline-gold"
          >
            <i className="fas fa-plus mr-2"></i>
            Новая задача
          </Button>
          <Button 
            onClick={() => setShowProjectModal(true)}
            className="btn-gold"
          >
            <i className="fas fa-project-diagram mr-2"></i>
            Новый проект
          </Button>
        </div>
      </div>

      {/* Projects Tabs */}
      <div className="flex overflow-x-auto space-x-4 pb-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedProject?.id === project.id
                ? 'bg-gold text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: project.color }}
            ></div>
            {project.name}
            <Badge className="ml-2 bg-black/20 text-xs">
              {Object.values(project.tasks).flat().length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="space-y-4"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center">
                  <i className={`${column.icon} text-gold mr-2`}></i>
                  <h3 className="text-white font-semibold">{column.title}</h3>
                </div>
                <Badge className="bg-gray-700 text-white">
                  {selectedProject.tasks[column.id].length}
                </Badge>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[400px]">
                {selectedProject.tasks[column.id].map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="glass-card p-4 cursor-move hover:shadow-lg transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="text-white font-semibold text-sm leading-tight">
                          {task.title}
                        </h4>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {getPriorityText(task.priority)}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400 text-xs">
                          <i className="fas fa-user mr-1"></i>
                          <span>{task.assignee}</span>
                        </div>
                        
                        {task.due_date && (
                          <div className={`flex items-center text-xs ${
                            isOverdue(task.due_date) ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            <i className="fas fa-calendar mr-1"></i>
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {formatDate(task.created_at)}
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="glass-card p-12 text-center">
          <i className="fas fa-project-diagram text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-2xl font-bold text-white mb-2">Нет проектов</h3>
          <p className="text-gray-400 mb-6">Создайте первый проект для управления задачами</p>
          <Button 
            onClick={() => setShowProjectModal(true)}
            className="btn-gold"
          >
            <i className="fas fa-plus mr-2"></i>
            Создать проект
          </Button>
        </Card>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="glass-card p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Новый проект</h3>
              <Button
                variant="ghost"
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название проекта *
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm(prev => ({...prev, name: e.target.value}))}
                  className="form-input w-full"
                  placeholder="Запуск нового автомобиля"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание
                </label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({...prev, description: e.target.value}))}
                  className="form-input w-full"
                  placeholder="Краткое описание проекта"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Цвет проекта
                </label>
                <div className="flex space-x-2">
                  {['#D4AF37', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProjectForm(prev => ({...prev, color}))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        projectForm.color === color ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="btn-gold">
                  <i className="fas fa-plus mr-2"></i>
                  Создать проект
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="btn-outline-gold"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="glass-card p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Новая задача</h3>
              <Button
                variant="ghost"
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название задачи *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({...prev, title: e.target.value}))}
                  className="form-input w-full"
                  placeholder="Подготовить фотографии"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({...prev, description: e.target.value}))}
                  className="form-input w-full"
                  placeholder="Детальное описание задачи"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Исполнитель
                  </label>
                  <input
                    type="text"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm(prev => ({...prev, assignee: e.target.value}))}
                    className="form-input w-full"
                    placeholder="Иван Петров"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Приоритет
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({...prev, priority: e.target.value}))}
                    className="form-input w-full"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Срок выполнения
                </label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm(prev => ({...prev, due_date: e.target.value}))}
                  className="form-input w-full"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="btn-gold">
                  <i className="fas fa-plus mr-2"></i>
                  Добавить задачу
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn-outline-gold"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;