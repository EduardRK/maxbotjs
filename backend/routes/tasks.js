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

router.get('/:userId', getTasksByDate);

router.post('/:userId', createTask);

router.put('/:userId/:taskId', updateTask);

router.delete('/:userId/:taskId', deleteTask);

router.patch('/:userId/:taskId/toggle', toggleTaskComplete);

router.patch('/:userId/:taskId/priority', updateTaskPriority);

export default router;