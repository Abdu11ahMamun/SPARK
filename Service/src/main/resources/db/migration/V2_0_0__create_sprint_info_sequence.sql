-- Create sequence for SprintInfo if it does not exist
DECLARE
  seq_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO seq_count FROM all_sequences WHERE sequence_name = 'SPARK_SPRINT_INFO_SEQ';
  IF seq_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SPARK_SPRINT_INFO_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
  END IF;
END;
/
