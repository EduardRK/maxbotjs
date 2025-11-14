import { pool } from '../models/database.js';

export const getStatsSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allTimeQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
      FROM tasks 
      WHERE user_id = $1
    `;

    const lastMonthQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
      FROM tasks 
      WHERE user_id = $1 
        AND due_date >= CURRENT_DATE - INTERVAL '30 days'
        AND due_date <= CURRENT_DATE
    `;

    const lastWeekQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
      FROM tasks 
      WHERE user_id = $1 
        AND due_date >= CURRENT_DATE - INTERVAL '7 days'
        AND due_date <= CURRENT_DATE
    `;

    const [allTimeResult, lastMonthResult, lastWeekResult] = await Promise.all([
      pool.query(allTimeQuery, [userId]),
      pool.query(lastMonthQuery, [userId]),
      pool.query(lastWeekQuery, [userId])
    ]);

    const stats = {
      allTime: {
        completed: parseInt(allTimeResult.rows[0].completed),
        total: parseInt(allTimeResult.rows[0].total)
      },
      lastMonth: {
        completed: parseInt(lastMonthResult.rows[0].completed),
        total: parseInt(lastMonthResult.rows[0].total)
      },
      lastWeek: {
        completed: parseInt(lastWeekResult.rows[0].completed),
        total: parseInt(lastWeekResult.rows[0].total)
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCalendarStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month parameters are required' });
    }

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const query = `
      SELECT 
        date,
        tasks_completed,
        total_tasks,
        tasks_completed > 0 as has_tasks
      FROM daily_stats 
      WHERE user_id = $1 
        AND date >= $2 
        AND date <= $3
      ORDER BY date
    `;
    
    const result = await pool.query(query, [userId, startDate, endDate]);
    
    const filledStats = fillMissingDays(result.rows, year, month);
    
    res.json(filledStats);
  } catch (error) {
    console.error('Error getting calendar stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDailyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date parameters are required' });
    }

    const query = `
      SELECT * FROM daily_stats 
      WHERE user_id = $1 
        AND date >= $2 
        AND date <= $3
      ORDER BY date
    `;
    
    const result = await pool.query(query, [userId, start_date, end_date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting daily stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fillMissingDays = (stats, year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const filledStats = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const existingStat = stats.find(stat => stat.date === date);

    if (existingStat) {
      filledStats.push(existingStat);
    } else {
      filledStats.push({
        date,
        tasks_completed: 0,
        total_tasks: 0,
        has_tasks: false
      });
    }
  }

  return filledStats;
};