import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initSQL = `
-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    motivational_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание таблицы задач
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание таблицы статистики
CREATE TABLE IF NOT EXISTS daily_stats (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);

-- Вставка тестовых данных (опционально)
INSERT INTO users (username, display_name, timezone, motivational_message) 
VALUES 
  ('test_user_1', 'Тестовый Пользователь 1', 'Europe/Moscow', 'Пора покорять новые вершины! 🚀'),
  ('test_user_2', 'Тестовый Пользователь 2', 'UTC', 'Каждый день - новая возможность! ✨')
ON CONFLICT (username) DO NOTHING;

-- Вставка тестовых задач
INSERT INTO tasks (user_id, title, description, priority, due_date, completed) 
SELECT 
  u.id,
  'Пример задачи 1',
  'Это описание примерной задачи',
  'high',
  CURRENT_DATE,
  true
FROM users u WHERE u.username = 'test_user_1'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (user_id, title, description, priority, due_date, completed) 
SELECT 
  u.id,
  'Пример задачи 2', 
  'Еще одна примерная задача',
  'medium',
  CURRENT_DATE + INTERVAL '1 day',
  false
FROM users u WHERE u.username = 'test_user_1'
ON CONFLICT DO NOTHING;
`;

async function initializeDatabase() {
  let client;
  try {
    console.log('🔗 Подключаюсь к базе данных...');
    client = await pool.connect();
    
    console.log('✅ Подключение успешно!');
    console.log('🗃️ Создаю таблицы...');
    
    await client.query(initSQL);
    
    console.log('✅ Таблицы созданы успешно!');
    console.log('📊 Проверяю созданные таблицы...');
    
    // Проверяем созданные таблицы
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Созданные таблицы:');
    tablesCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Проверяем тестовые данные
    const usersCheck = await client.query('SELECT COUNT(*) as user_count FROM users');
    const tasksCheck = await client.query('SELECT COUNT(*) as task_count FROM tasks');
    
    console.log(`👥 Пользователей: ${usersCheck.rows[0].user_count}`);
    console.log(`✅ Задач: ${tasksCheck.rows[0].task_count}`);
    
    console.log('\n🎉 База данных успешно инициализирована!');
    console.log('🚀 Теперь можно запускать сервер: npm run dev');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

initializeDatabase();