import express from 'express';
import { 
  createUser, 
  getUser, 
  updateUser 
} from '../controllers/userController.js';

const router = express.Router();

// POST /api/users - Create new user
router.post('/', createUser);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUser);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

export default router;