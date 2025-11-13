import express from 'express';
import { 
  getTasksByDate,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  updateTaskPriority
} from '../controllers/taskController.js';

const router = express.Router();

// ИЗМЕНИ ВСЕ МАРШРУТЫ - убери :userId из пути
// GET /api/tasks/:userId - Get tasks by date
router.get('/:userId', getTasksByDate);

// POST /api/tasks/:userId - Create new task  
router.post('/:userId', createTask);

// PUT /api/tasks/:userId/:taskId - Update task
router.put('/:userId/:taskId', updateTask);

// DELETE /api/tasks/:userId/:taskId - Delete task
router.delete('/:userId/:taskId', deleteTask);

// PATCH /api/tasks/:userId/:taskId/toggle - Toggle task completion
router.patch('/:userId/:taskId/toggle', toggleTaskComplete);

// PATCH /api/tasks/:userId/:taskId/priority - Update task priority
router.patch('/:userId/:taskId/priority', updateTaskPriority);

export default router;