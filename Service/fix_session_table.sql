-- Fix SPARK_USER_SESSION_METADATA table USERNAME column
-- Run this script manually in your Oracle database

-- Check if USERNAME column exists
DECLARE
  col_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO col_count 
  FROM user_tab_columns 
  WHERE table_name = 'SPARK_USER_SESSION_METADATA' 
  AND column_name = 'USERNAME';
  
  IF col_count = 0 THEN
    -- Add the USERNAME column if it doesn't exist
    EXECUTE IMMEDIATE 'ALTER TABLE SPARK_USER_SESSION_METADATA ADD username VARCHAR2(100)';
    DBMS_OUTPUT.PUT_LINE('Added USERNAME column');
    
    -- Update existing records to have username from user table (if any exist)
    EXECUTE IMMEDIATE 'UPDATE SPARK_USER_SESSION_METADATA 
                       SET username = (
                         SELECT u.username 
                         FROM SPARK_USER u 
                         WHERE u.id = SPARK_USER_SESSION_METADATA.user_id
                       ) 
                       WHERE username IS NULL';
    
    -- Make the column NOT NULL after updating existing data
    EXECUTE IMMEDIATE 'ALTER TABLE SPARK_USER_SESSION_METADATA MODIFY username VARCHAR2(100) NOT NULL';
    DBMS_OUTPUT.PUT_LINE('Made USERNAME column NOT NULL');
  ELSE
    DBMS_OUTPUT.PUT_LINE('USERNAME column already exists');
    
    -- Just update any NULL values if they exist
    UPDATE SPARK_USER_SESSION_METADATA 
    SET username = (
      SELECT u.username 
      FROM SPARK_USER u 
      WHERE u.id = SPARK_USER_SESSION_METADATA.user_id
    ) 
    WHERE username IS NULL;
    
    -- Check if column is nullable and make it NOT NULL if needed
    DECLARE
      nullable_count NUMBER;
    BEGIN
      SELECT COUNT(*) INTO nullable_count 
      FROM user_tab_columns 
      WHERE table_name = 'SPARK_USER_SESSION_METADATA' 
      AND column_name = 'USERNAME'
      AND nullable = 'Y';
      
      IF nullable_count > 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE SPARK_USER_SESSION_METADATA MODIFY username VARCHAR2(100) NOT NULL';
        DBMS_OUTPUT.PUT_LINE('Made USERNAME column NOT NULL');
      ELSE
        DBMS_OUTPUT.PUT_LINE('USERNAME column is already NOT NULL');
      END IF;
    END;
  END IF;
END;
/

-- Clean up any existing session records that might have NULL username
DELETE FROM SPARK_USER_SESSION_METADATA WHERE username IS NULL;

-- Commit the changes
COMMIT;

-- Verify the change
SELECT column_name, nullable, data_type, data_length 
FROM user_tab_columns 
WHERE table_name = 'SPARK_USER_SESSION_METADATA' 
AND column_name = 'USERNAME';