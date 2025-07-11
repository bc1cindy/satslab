-- Function to get accurate unique user count from all sessions
CREATE OR REPLACE FUNCTION get_unique_user_count()
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id) 
    FROM user_sessions 
    WHERE user_id LIKE 'session_%'
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unique_user_count() TO anon, authenticated;