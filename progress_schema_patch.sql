-- Run once for an existing database before using /api/progress or personalized paths.
-- This patch is idempotent for the column and index checks.

SET @has_theory_progress = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'user_progress'
    AND column_name = 'theory_progress'
);
SET @add_theory_progress = IF(
  @has_theory_progress = 0,
  'ALTER TABLE user_progress ADD COLUMN theory_progress INT DEFAULT 0 AFTER progress',
  'SELECT 1'
);
PREPARE theory_stmt FROM @add_theory_progress;
EXECUTE theory_stmt;
DEALLOCATE PREPARE theory_stmt;

SET @has_progress_index = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'user_progress'
    AND index_name = 'uq_user_progress'
);
SET @add_progress_index = IF(
  @has_progress_index = 0,
  'ALTER TABLE user_progress ADD UNIQUE KEY uq_user_progress (user_id, algorithm_id)',
  'SELECT 1'
);
PREPARE progress_index_stmt FROM @add_progress_index;
EXECUTE progress_index_stmt;
DEALLOCATE PREPARE progress_index_stmt;
