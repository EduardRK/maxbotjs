import { pool } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const motivationalMessages = [
  "Пора покорять новые вершины! 🚀",
  "Каждый день - новая возможность! ✨", 
  "Ты можешь больше, чем думаешь! 💪",
  "Маленькие шаги ведут к большим целям! 🎯",
  "Сегодня - идеальный день для начала! 🌟"
];

export const createUser = async (req, res) => {
  try {
    const { username, display_name, timezone = 'UTC' } = req.body;
    
    if (!username || !display_name) {
      return res.status(400).json({ error: 'Username and display_name are required' });
    }

    const id = uuidv4();
    const motivational_message = motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];

    const query = `
      INSERT INTO users (id, username, display_name, timezone, motivational_message) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    
    const values = [id, username, display_name, timezone, motivational_message];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Username already exists' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, timezone, motivational_message } = req.body;
    
    const query = `
      UPDATE users 
      SET display_name = COALESCE($1, display_name),
          timezone = COALESCE($2, timezone),
          motivational_message = COALESCE($3, motivational_message),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [display_name, timezone, motivational_message, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};