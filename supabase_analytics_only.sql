-- ===============================================
-- SatsLab Analytics System - Standalone Version
-- ===============================================
-- Este script cria apenas as tabelas de analytics sem foreign keys
-- Use este se não quiser criar as tabelas base primeiro

-- 1. Criar tabela de sessões de usuário (sem foreign key)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  geolocation JSONB,
  total_duration_seconds INTEGER DEFAULT 0,
  pages_visited JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de eventos de usuário (sem foreign key)
CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  module_id INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Check constraint for event types
  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      'page_view', 'module_start', 'module_complete', 
      'task_start', 'task_complete', 'question_answer', 
      'badge_earned', 'wallet_created', 'session_start', 'session_end'
    )
  )
);

-- 3. Criar tabela de analytics agregados (sem foreign key)
CREATE TABLE IF NOT EXISTS user_analytics_summary (
  user_id TEXT PRIMARY KEY,
  total_time_spent_seconds INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  wallets_created INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_start ON user_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_user_sessions_geolocation ON user_sessions USING GIN (geolocation);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON user_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_module_id ON user_events(module_id);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);

CREATE INDEX IF NOT EXISTS idx_user_analytics_last_active ON user_analytics_summary(last_active_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_modules_completed ON user_analytics_summary(modules_completed);

-- 5. Criar view para analytics em tempo real
CREATE OR REPLACE VIEW realtime_analytics AS
SELECT 
  COUNT(DISTINCT us.user_id) as active_users,
  COUNT(DISTINCT us.id) as active_sessions,
  COUNT(DISTINCT CASE 
    WHEN us.session_start > NOW() - INTERVAL '24 hours' THEN us.user_id 
  END) as daily_active_users,
  COUNT(DISTINCT CASE 
    WHEN us.session_start > NOW() - INTERVAL '7 days' THEN us.user_id 
  END) as weekly_active_users,
  COALESCE(AVG(us.total_duration_seconds), 0) as avg_session_duration
FROM user_sessions us
WHERE us.session_start > NOW() - INTERVAL '30 days';

-- 6. Criar função para atualizar analytics automaticamente
CREATE OR REPLACE FUNCTION update_user_analytics_on_session_end()
RETURNS TRIGGER AS $$
BEGIN
  -- Só processa se session_end foi definido
  IF NEW.session_end IS NOT NULL AND OLD.session_end IS NULL THEN
    INSERT INTO user_analytics_summary (
      user_id,
      total_time_spent_seconds,
      last_active_at,
      total_sessions,
      modules_completed,
      tasks_completed,
      badges_earned,
      wallets_created,
      first_seen_at,
      updated_at
    ) VALUES (
      NEW.user_id,
      COALESCE(NEW.total_duration_seconds, 0),
      NOW(),
      1,
      0, 0, 0, 0,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_time_spent_seconds = user_analytics_summary.total_time_spent_seconds + COALESCE(NEW.total_duration_seconds, 0),
      last_active_at = NOW(),
      total_sessions = user_analytics_summary.total_sessions + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar função para atualizar analytics baseado em eventos
CREATE OR REPLACE FUNCTION update_analytics_on_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar analytics summary baseado no tipo de evento
  IF NEW.event_type IN ('module_complete', 'task_complete', 'badge_earned', 'wallet_created') THEN
    INSERT INTO user_analytics_summary (
      user_id,
      modules_completed,
      tasks_completed,
      badges_earned,
      wallets_created,
      last_active_at,
      first_seen_at,
      updated_at
    ) VALUES (
      NEW.user_id,
      CASE WHEN NEW.event_type = 'module_complete' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'task_complete' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'badge_earned' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'wallet_created' THEN 1 ELSE 0 END,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      modules_completed = user_analytics_summary.modules_completed + 
        CASE WHEN NEW.event_type = 'module_complete' THEN 1 ELSE 0 END,
      tasks_completed = user_analytics_summary.tasks_completed + 
        CASE WHEN NEW.event_type = 'task_complete' THEN 1 ELSE 0 END,
      badges_earned = user_analytics_summary.badges_earned + 
        CASE WHEN NEW.event_type = 'badge_earned' THEN 1 ELSE 0 END,
      wallets_created = user_analytics_summary.wallets_created + 
        CASE WHEN NEW.event_type = 'wallet_created' THEN 1 ELSE 0 END,
      last_active_at = NOW(),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar triggers
CREATE TRIGGER update_analytics_on_session_end
AFTER UPDATE OF session_end ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_analytics_on_session_end();

CREATE TRIGGER update_analytics_on_event_insert
AFTER INSERT ON user_events
FOR EACH ROW
EXECUTE FUNCTION update_analytics_on_event();

-- 9. Habilitar Row Level Security (RLS)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics_summary ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas de segurança flexíveis
-- Permite todos os usuários autenticados
CREATE POLICY "Authenticated users can manage sessions" ON user_sessions
  FOR ALL USING (true);

CREATE POLICY "Authenticated users can manage events" ON user_events
  FOR ALL USING (true);

CREATE POLICY "Authenticated users can view analytics" ON user_analytics_summary
  FOR ALL USING (true);

-- 11. Criar view para estatísticas por módulo
CREATE OR REPLACE VIEW module_analytics AS
SELECT 
  e.module_id,
  COUNT(DISTINCT e.user_id) as unique_users,
  COUNT(CASE WHEN e.event_type = 'module_start' THEN 1 END) as module_starts,
  COUNT(CASE WHEN e.event_type = 'module_complete' THEN 1 END) as module_completions,
  COUNT(CASE WHEN e.event_type = 'task_complete' THEN 1 END) as task_completions,
  COUNT(CASE WHEN e.event_type = 'badge_earned' THEN 1 END) as badges_earned,
  CASE 
    WHEN COUNT(CASE WHEN e.event_type = 'module_start' THEN 1 END) > 0 
    THEN (COUNT(CASE WHEN e.event_type = 'module_complete' THEN 1 END)::float / 
          COUNT(CASE WHEN e.event_type = 'module_start' THEN 1 END)::float) * 100
    ELSE 0 
  END as completion_rate
FROM user_events e
WHERE e.module_id IS NOT NULL
GROUP BY e.module_id
ORDER BY e.module_id;

-- 12. Criar função para obter estatísticas gerais
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE(
  total_users BIGINT,
  active_users_24h BIGINT,
  active_users_7d BIGINT,
  total_sessions BIGINT,
  avg_session_duration NUMERIC,
  total_modules_completed BIGINT,
  total_badges_earned BIGINT,
  total_wallets_created BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT uas.user_id) as total_users,
    COUNT(DISTINCT CASE 
      WHEN uas.last_active_at > NOW() - INTERVAL '24 hours' THEN uas.user_id 
    END) as active_users_24h,
    COUNT(DISTINCT CASE 
      WHEN uas.last_active_at > NOW() - INTERVAL '7 days' THEN uas.user_id 
    END) as active_users_7d,
    COALESCE(SUM(uas.total_sessions), 0) as total_sessions,
    CASE 
      WHEN SUM(uas.total_sessions) > 0 
      THEN ROUND(SUM(uas.total_time_spent_seconds)::NUMERIC / SUM(uas.total_sessions)::NUMERIC, 2)
      ELSE 0 
    END as avg_session_duration,
    COALESCE(SUM(uas.modules_completed), 0) as total_modules_completed,
    COALESCE(SUM(uas.badges_earned), 0) as total_badges_earned,
    COALESCE(SUM(uas.wallets_created), 0) as total_wallets_created
  FROM user_analytics_summary uas;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- Instruções de Uso:
-- ===============================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se todas as tabelas foram criadas:
--    - user_sessions
--    - user_events  
--    - user_analytics_summary
-- 3. Teste as views:
--    SELECT * FROM realtime_analytics;
--    SELECT * FROM module_analytics;
-- 4. Teste a função:
--    SELECT * FROM get_platform_stats();
-- ===============================================