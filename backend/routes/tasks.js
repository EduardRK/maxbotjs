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

// GET /api/users/:userId/tasks - Get tasks by date
router.get('/:userId/tasks', getTasksByDate);

// POST /api/users/:userId/tasks - Create new task
router.post('/:userId/tasks', createTask);

// PUT /api/users/:userId/tasks/:taskId - Update task
router.put('/:userId/tasks/:taskId', updateTask);

// DELETE /api/users/:userId/tasks/:taskId - Delete task
router.delete('/:userId/tasks/:taskId', deleteTask);

// PATCH /api/users/:userId/tasks/:taskId/toggle - Toggle task completion
router.patch('/:userId/tasks/:taskId/toggle', toggleTaskComplete);

// PATCH /api/users/:userId/tasks/:taskId/priority - Update task priority
router.patch('/:userId/tasks/:taskId/priority', updateTaskPriority);

export default router;