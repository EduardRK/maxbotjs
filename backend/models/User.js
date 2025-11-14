import { pool } from './database.js';

export class User {
  static async create(userData) {
    const { username, display_name, timezone = 'UTC', motivational_message } = userData;
    
    const query = `
      INSERT INTO users (username, display_name, timezone, motivational_message) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    const values = [username, display_name, timezone, motivational_message];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const { display_name, timezone, motivational_message } = updateData;
    
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
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(limit = 100, offset = 0) {
    const query = 'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async exists(id) {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
    const result = await pool.query(query, [id]);
    return result.rows[0].exists;
  }

  static async getUserStats(userId) {
    const tasksQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN completed = false AND due_date < CURRENT_DATE THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE user_id = $1
    `;

    const recentActivityQuery = `
      SELECT 
        COUNT(*) as tasks_created_last_week
      FROM tasks 
      WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const [tasksResult, activityResult] = await Promise.all([
      pool.query(tasksQuery, [userId]),
      pool.query(recentActivityQuery, [userId])
    ]);

    return {
      total_tasks: parseInt(tasksResult.rows[0].total_tasks),
      completed_tasks: parseInt(tasksResult.rows[0].completed_tasks),
      overdue_tasks: parseInt(tasksResult.rows[0].overdue_tasks),
      tasks_created_last_week: parseInt(activityResult.rows[0].tasks_created_last_week),
      completion_rate: tasksResult.rows[0].total_tasks > 0 
        ? (parseInt(tasksResult.rows[0].completed_tasks) / parseInt(tasksResult.rows[0].total_tasks) * 100).toFixed(1)
        : 0
    };
  }
}

export default User;