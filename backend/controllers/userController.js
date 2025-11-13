import { pool } from '../models/database.js';

// В методе создания пользователя
export const createUser = async (req, res) => {
  try {
    const { max_user_id, display_name, username, timezone, motivational_message } = req.body;

    // Если пришли MAX данные - используем max_user_id
    if (max_user_id) {
      // Проверяем, есть ли уже пользователь с таким max_user_id
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE max_user_id = $1',
        [max_user_id]
      );

      if (existingUser.rows.length > 0) {
        return res.json(existingUser.rows[0]);
      }

      // Создаем нового пользователя с max_user_id
      const result = await pool.query(
        `INSERT INTO users 
         (max_user_id, display_name, username, timezone, motivational_message) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [max_user_id, display_name, username, timezone, motivational_message]
      );
      
      return res.status(201).json(result.rows[0]);
    }

    // Обычная логика для браузера
    const result = await pool.query(
      `INSERT INTO users 
       (display_name, username, timezone, motivational_message) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [display_name, username, timezone, motivational_message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// ДОБАВЬ ЭТИ ДВА МЕТОДА:
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, username, timezone, motivational_message } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET display_name = $1, username = $2, timezone = $3, motivational_message = $4 
       WHERE id = $5 
       RETURNING *`,
      [display_name, username, timezone, motivational_message, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};