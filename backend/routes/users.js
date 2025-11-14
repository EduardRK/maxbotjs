import express from 'express';
import { 
  createUser, 
  getUser, 
  updateUser 
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser);

router.get('/:id', getUser);

router.put('/:id', updateUser);

export default router;