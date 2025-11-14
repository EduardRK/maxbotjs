import { pool } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getTasksByDate = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 AND due_date = $2 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId, date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description, priority = 'medium', due_date } = req.body;

    if (!title || !due_date) {
      return res.status(400).json({ error: 'Title and due_date are required' });
    }

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const id = uuidv4();
    const query = `
      INSERT INTO tasks (id, user_id, title, description, priority, due_date) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const values = [id, userId, title, description, priority, due_date];
    const result = await pool.query(query, values);
    
    await updateDailyStats(userId, due_date);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    const { title, description, priority, due_date } = req.body;

    const query = `
      UPDATE tasks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          due_date = COALESCE($4, due_date),
          updated_at = NOW()
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    
    const values = [title, description, priority, due_date, taskId, userId];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (due_date) {
      await updateDailyStats(userId, due_date);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { userId, taskId } = req.params;

    const taskQuery = await pool.query(
      'SELECT due_date FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const due_date = taskQuery.rows[0].due_date;

    const deleteQuery = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2';
    await pool.query(deleteQuery, [taskId, userId]);

    await updateDailyStats(userId, due_date);
    
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleTaskComplete = async (req, res) => {
  try {
    const { userId, taskId } = req.params;

    const query = `
      UPDATE tasks 
      SET completed = NOT completed,
          completed_at = CASE 
            WHEN completed = false THEN NOW() 
            ELSE NULL 
          END,
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [taskId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = result.rows[0];
    await updateDailyStats(userId, task.due_date);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskPriority = async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    const { priority } = req.body;

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    const query = `
      UPDATE tasks 
      SET priority = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [priority, taskId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateDailyStats = async (userId, date) => {
  try {
    const statsQuery = `
      INSERT INTO daily_stats (user_id, date, tasks_completed, total_tasks)
      SELECT 
        $1 as user_id,
        $2 as date,
        COUNT(CASE WHEN completed = true THEN 1 END) as tasks_completed,
        COUNT(*) as total_tasks
      FROM tasks 
      WHERE user_id = $1 AND due_date = $2
      ON CONFLICT (user_id, date) 
      DO UPDATE SET 
        tasks_completed = EXCLUDED.tasks_completed,
        total_tasks = EXCLUDED.total_tasks
    `;
    
    await pool.query(statsQuery, [userId, date]);
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
};