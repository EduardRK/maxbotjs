import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import Statistics from './components/Statistics';
import Welcome from './components/Welcome';
import { usersAPI, tasksAPI, statsAPI } from './services/api';

const App = () => {
  // State
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [statsOpen, setStatsOpen] = useState(false);
  const [editingDescriptionId, setEditingDescriptionId] = useState(null);
  const [editingDescriptionText, setEditingDescriptionText] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [statsData, setStatsData] = useState({
    allTime: { completed: 0, total: 0 },
    lastMonth: { completed: 0, total: 0 },
    lastWeek: { completed: 0, total: 0 }
  });
  const [calendarDays, setCalendarDays] = useState([]);
  const [loading, setLoading] = useState(false);

  // Инициализация пользователя
  useEffect(() => {
    initializeUser();
  }, []);

  // Загрузка данных при изменении даты или пользователя
  useEffect(() => {
    if (user) {
      loadTasks();
      loadStats();
      loadCalendar();
    }
  }, [currentDate, user, selectedDate]);

  const initializeUser = async () => {
    let userData = localStorage.getItem('currentUser');
    
    if (!userData) {
      // Создаем нового пользователя
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const motivationalMessages = [
        "Пора покорять новые вершины! 🚀",
        "Каждый день - новая возможность! ✨", 
        "Ты можешь больше, чем думаешь! 💪",
        "Маленькие шаги ведут к большим целям! 🎯",
        "Сегодня - идеальный день для начала! 🌟"
      ];
      
      try {
        const response = await usersAPI.create({
          username: `user_${Date.now()}`,
          display_name: 'Пользователь',
          timezone: timezone,
          motivational_message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
        });
        
        userData = response.data;
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } catch (error) {
        console.error('Error creating user:', error);
        return;
      }
    } else {
      userData = JSON.parse(userData);
    }
    
    setUser(userData);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 5000);
  };

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await tasksAPI.getByDate(user.id, dateString);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const response = await statsAPI.getSummary(user.id);
      setStatsData(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCalendar = async () => {
    if (!user) return;
    
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await statsAPI.getCalendar(user.id, year, month);
      setCalendarDays(response.data);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const addTask = async () => {
    if (newTaskTitle.trim() === '' || !user) return;
    
    try {
      const taskData = {
        title: newTaskTitle,
        due_date: selectedDate.toISOString().split('T')[0],
        priority: 'medium'
      };
      
      const response = await tasksAPI.create(user.id, taskData);
      setTasks(prev => [...prev, response.data]);
      setNewTaskTitle('');
      
      // Обновляем статистику и календарь
      loadStats();
      loadCalendar();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    if (!user) return;
    
    try {
      await tasksAPI.toggleComplete(user.id, taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
      
      // Обновляем статистику и календарь
      loadStats();
      loadCalendar();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const setTaskPriority = async (taskId, priority) => {
    if (!user) return;
    
    try {
      await tasksAPI.updatePriority(user.id, taskId, priority);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, priority } : task
      ));
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const saveTaskDescription = async (taskId) => {
    if (!user) return;
    
    try {
      await tasksAPI.update(user.id, taskId, { description: editingDescriptionText });
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, description: editingDescriptionText } : task
      ));
      setEditingDescriptionId(null);
    } catch (error) {
      console.error('Error saving description:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!user) return;
    
    try {
      await tasksAPI.delete(user.id, taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Обновляем статистику и календарь
      loadStats();
      loadCalendar();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Навигация по календарю
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Обработчик выбора даты в календаре
  const handleDateSelect = (day) => {
    if (day.isCurrentMonth) {
      const newSelectedDate = new Date(day.year, day.month, day.day);
      setSelectedDate(newSelectedDate);
    }
  };

  // Генерация дней календаря с реальными данными
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Предыдущий месяц
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }
    
    // Текущий месяц с реальными данными
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayStats = calendarDays.find(day => day.date === dateStr);
      
      // ПРАВИЛЬНОЕ вычисление выбранной даты
      const isSelected = 
        i === selectedDate.getDate() && 
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear();
      
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        isSelected: isSelected,
        hasTasks: dayStats ? dayStats.tasks_completed > 0 : false,
        tasksCompleted: dayStats ? dayStats.tasks_completed : 0
      });
    }
    
    // Следующий месяц
    const daysToAdd = 42 - days.length;
    for (let i = 1; i <= daysToAdd; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const days = getDaysInMonth();

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  if (showWelcome && user) {
    return <Welcome user={user} onClose={handleCloseWelcome} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header with stats button - УМЕНЬШЕН ШРИФТ */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
        <button 
          onClick={() => setStatsOpen(true)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Статистика"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          <span className="font-medium text-sm">Статистика</span>
        </button>
        {/* Дата сверху теперь показывает ВЫБРАННУЮ дату */}
        <div className="text-gray-600 font-medium text-sm">
          {selectedDate.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </header>

      {/* Main content: Todo list + Calendar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Todo List - Top Half */}
        <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Задачи на {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</h2>
            
            {/* Add new task */}
            <div className="flex mb-6">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Новая задача..."
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <button
                onClick={addTask}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg transition-colors"
                aria-label="Добавить задачу"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tasks list */}
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`border rounded-lg p-4 shadow-sm transition-all ${
                    task.completed ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-3 mt-1">
                      {/* Priority selector button */}
                      <div className="relative group">
                        <button
                          onClick={() => {
                            const priorities = ['low', 'medium', 'high'];
                            const currentIndex = priorities.indexOf(task.priority);
                            const nextIndex = (currentIndex + 1) % priorities.length;
                            setTaskPriority(task.id, priorities[nextIndex]);
                          }}
                          className={`w-5 h-5 rounded-full mb-2 flex items-center justify-center transition-colors ${
                            task.priority === 'high' ? 'bg-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          } hover:opacity-80`}
                          title={`Приоритет: ${
                            task.priority === 'high' ? 'Высокий' :
                            task.priority === 'medium' ? 'Средний' : 'Низкий'
                          }`}
                        >
                          <span className="text-white text-xs">
                            {task.priority === 'high' ? '!' : 
                             task.priority === 'medium' ? '!!' : '!!!'}
                          </span>
                        </button>
                      </div>
                      
                      {/* Description button */}
                      <button
                        onClick={() => {
                          setEditingDescriptionId(task.id);
                          setEditingDescriptionText(task.description);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          task.description ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        } hover:bg-blue-200 transition-colors`}
                        title={task.description ? 'Изменить описание' : 'Добавить описание'}
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <p className={`ml-3 font-medium break-words ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </p>
                      </div>
                      
                      {/* Description editing */}
                      {editingDescriptionId === task.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editingDescriptionText}
                            onChange={(e) => setEditingDescriptionText(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Введите описание задачи..."
                            rows="2"
                          />
                          <div className="mt-2 flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingDescriptionId(null)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Отмена
                            </button>
                            <button
                              onClick={() => saveTaskDescription(task.id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Сохранить
                            </button>
                          </div>
                        </div>
                      ) : task.description ? (
                        <p className="mt-1 text-sm text-gray-600 ml-7 break-words">{task.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <p className="text-center text-gray-500 py-8">Нет задач на {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Calendar - Bottom Half */}
        <div className="w-full md:w-1/2 p-4 bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Календарь</h2>
            
            {/* Calendar header with month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="font-bold text-lg text-gray-800">
                {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Следующий месяц"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Calendar days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                <div 
                  key={day} 
                  className={`text-center text-sm font-medium py-1 ${
                    [5, 6].includes(index) ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isToday = 
                  day.isCurrentMonth && 
                  day.day === new Date().getDate() && 
                  day.month === new Date().getMonth() &&
                  day.year === new Date().getFullYear();
                
                return (
                  <button
                    key={`${day.year}-${day.month}-${day.day}-${index}`}
                    onClick={() => handleDateSelect(day)}
                    className={`aspect-square flex flex-col items-center justify-center text-sm transition-colors rounded-lg ${
                      day.isCurrentMonth
                        ? isToday && day.isSelected
                          ? 'bg-blue-600 text-white font-medium'
                          : isToday
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : day.isSelected
                          ? 'bg-blue-500 text-white font-medium'
                          : day.hasTasks
                          ? 'text-gray-800 hover:bg-gray-100'
                          : 'text-gray-600 hover:bg-gray-50'
                        : 'text-gray-400'
                    }`}
                    disabled={!day.isCurrentMonth}
                  >
                    <span>{day.day}</span>
                    {day.isCurrentMonth && day.hasTasks && !day.isSelected && (
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics Modal */}
      <Statistics 
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        statsData={statsData}
      />
    </div>
  );
};

export default App;