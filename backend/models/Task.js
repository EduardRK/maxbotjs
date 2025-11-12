import { pool } from './database.js';

export class Task {
  // Создание новой задачи
  static async create(taskData) {
    const { user_id, title, description, priority = 'medium', due_date } = taskData;
    
    const query = `
      INSERT INTO tasks (user_id, title, description, priority, due_date) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    
    const values = [user_id, title, description, priority, due_date];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Поиск задачи по ID
  static async findById(id, userId = null) {
    let query = 'SELECT * FROM tasks WHERE id = $1';
    let values = [id];
    
    if (userId) {
      query += ' AND user_id = $2';
      values.push(userId);
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Получение задач пользователя за определенную дату
  static async findByUserAndDate(userId, date, options = {}) {
    const { completed = null, priority = null } = options;
    
    let query = 'SELECT * FROM tasks WHERE user_id = $1 AND due_date = $2';
    const values = [userId, date];
    
    if (completed !== null) {
      values.push(completed);
      query += ` AND completed = $${values.length}`;
    }
    
    if (priority) {
      values.push(priority);
      query += ` AND priority = $${values.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Получение всех задач пользователя
  static async findByUser(userId, options = {}) {
    const { limit = 100, offset = 0, completed = null, priority = null } = options;
    
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const values = [userId];
    let paramCount = 1;
    
    if (completed !== null) {
      paramCount++;
      values.push(completed);
      query += ` AND completed = $${paramCount}`;
    }
    
    if (priority) {
      paramCount++;
      values.push(priority);
      query += ` AND priority = $${paramCount}`;
    }
    
    query += ` ORDER BY due_date DESC, created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Обновление задачи
  static async update(id, userId, updateData) {
    const { title, description, priority, due_date, completed } = updateData;
    
    const query = `
      UPDATE tasks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          due_date = COALESCE($4, due_date),
          completed = COALESCE($5, completed),
          completed_at = CASE 
            WHEN $5 = true AND completed = false THEN NOW()
            WHEN $5 = false THEN NULL
            ELSE completed_at 
          END,
          updated_at = NOW()
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `;
    
    const values = [title, description, priority, due_date, completed, id, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Удаление задачи
  static async delete(id, userId) {
    const query = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Переключение статуса выполнения
  static async toggleComplete(id, userId) {
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
    
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Обновление приоритета
  static async updatePriority(id, userId, priority) {
    const query = `
      UPDATE tasks 
      SET priority = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [priority, id, userId]);
    return result.rows[0];
  }

  // Получение просроченных задач
  static async getOverdueTasks(userId) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
        AND completed = false 
        AND due_date < CURRENT_DATE
      ORDER BY due_date ASC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Получение задач на сегодня
  static async getTodayTasks(userId) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
        AND due_date = CURRENT_DATE
      ORDER BY priority DESC, created_at ASC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Получение статистики по приоритетам
  static async getPriorityStats(userId) {
    const query = `
      SELECT 
        priority,
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
      FROM tasks 
      WHERE user_id = $1
      GROUP BY priority
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

export default Task;