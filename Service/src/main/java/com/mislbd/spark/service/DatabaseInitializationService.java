package com.mislbd.spark.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

/**
 * Database initialization service for RBAC tables
 * 
 * This service creates the necessary RBAC tables if they don't exist
 * and handles Oracle-specific DDL issues that Hibernate can't handle properly.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Service
public class DatabaseInitializationService implements CommandLineRunner {
    
    private static final Logger logger = Logger.getLogger(DatabaseInitializationService.class.getName());
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Starting RBAC database initialization...");
        
        try {
            // Create RBAC tables if they don't exist
            createRBACTables();
            logger.info("RBAC database initialization completed successfully!");
            
        } catch (Exception e) {
            logger.severe("Error during database initialization: " + e.getMessage());
            // Don't fail the application startup - just log the error
        }
    }
    
    private void createRBACTables() {
        try {
            // 1. Create sequences for primary keys
            createSequences();
            
            // 2. Create SPARK_PERMISSION table
            createPermissionTable();
            
            // 3. Create SPARK_ROLE_PERMISSION table
            createRolePermissionTable();
            
            // 4. Create SPARK_USER_ROLE table
            createUserRoleTable();
            
            // 5. Update SPARK_ROLE table with new columns
            updateRoleTable();
            
            // 6. Create indexes
            createIndexes();
            
        } catch (Exception e) {
            logger.warning("Some DDL operations failed (this is normal if tables already exist): " + e.getMessage());
        }
    }
    
    private void createSequences() {
        String[] sequences = {
            "CREATE SEQUENCE SEQ_SPARK_PERMISSION START WITH 1 INCREMENT BY 1 NOCACHE",
            "CREATE SEQUENCE SEQ_SPARK_ROLE_PERMISSION START WITH 1 INCREMENT BY 1 NOCACHE",
            "CREATE SEQUENCE SEQ_SPARK_USER_ROLE START WITH 1 INCREMENT BY 1 NOCACHE"
        };
        
        for (String seq : sequences) {
            try {
                jdbcTemplate.execute(seq);
                logger.info("Created sequence: " + seq.substring(16, seq.indexOf(" START")));
            } catch (Exception e) {
                logger.info("Sequence might already exist: " + e.getMessage());
            }
        }
    }
    
    private void createIndexes() {
        String[] indexes = {
            "CREATE INDEX idx_permission_code ON SPARK_PERMISSION(code)",
            "CREATE INDEX idx_permission_resource ON SPARK_PERMISSION(resource)",
            "CREATE INDEX idx_permission_active ON SPARK_PERMISSION(active)",
            "CREATE INDEX idx_role_permission_role ON SPARK_ROLE_PERMISSION(role_id)",
            "CREATE INDEX idx_role_permission_permission ON SPARK_ROLE_PERMISSION(permission_id)",
            "CREATE INDEX idx_user_role_user ON SPARK_USER_ROLE(user_id)",
            "CREATE INDEX idx_user_role_role ON SPARK_USER_ROLE(role_id)",
            "CREATE INDEX idx_user_role_active ON SPARK_USER_ROLE(active)"
        };
        
        for (String index : indexes) {
            try {
                jdbcTemplate.execute(index);
                logger.info("Created index: " + index.substring(13, index.indexOf(" ON")));
            } catch (Exception e) {
                logger.info("Index might already exist: " + e.getMessage());
            }
        }
    }
    
    private void createPermissionTable() {
        String sql = """
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE SPARK_PERMISSION (
                    id NUMBER(19) NOT NULL,
                    code VARCHAR2(100) NOT NULL,
                    name VARCHAR2(100) NOT NULL,
                    description VARCHAR2(255) NOT NULL,
                    resource VARCHAR2(50) NOT NULL,
                    action VARCHAR2(20) NOT NULL,
                    category VARCHAR2(50),
                    display_order NUMBER(10),
                    active NUMBER(1) DEFAULT 1,
                    system_permission NUMBER(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by VARCHAR2(100),
                    updated_by VARCHAR2(100),
                    CONSTRAINT pk_spark_permission PRIMARY KEY (id),
                    CONSTRAINT uk_permission_code UNIQUE (code),
                    CONSTRAINT uk_permission_name UNIQUE (name),
                    CONSTRAINT chk_permission_active CHECK (active IN (0, 1)),
                    CONSTRAINT chk_permission_system CHECK (system_permission IN (0, 1))
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN -- ORA-00955: name already used by existing object
                        RAISE;
                    END IF;
            END;
            """;
        
        jdbcTemplate.execute(sql);
        logger.info("SPARK_PERMISSION table creation attempted");
    }
    
    private void createRolePermissionTable() {
        String sql = """
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE SPARK_ROLE_PERMISSION (
                    id NUMBER(19) NOT NULL,
                    role_id NUMBER(19) NOT NULL,
                    permission_id NUMBER(19) NOT NULL,
                    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    granted_by VARCHAR2(100),
                    notes VARCHAR2(500),
                    active NUMBER(1) DEFAULT 1,
                    CONSTRAINT pk_spark_role_permission PRIMARY KEY (id),
                    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES SPARK_ROLE(id),
                    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES SPARK_PERMISSION(id),
                    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id),
                    CONSTRAINT chk_role_permission_active CHECK (active IN (0, 1))
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN
                        RAISE;
                    END IF;
            END;
            """;
        
        jdbcTemplate.execute(sql);
        logger.info("SPARK_ROLE_PERMISSION table creation attempted");
    }
    
    private void createUserRoleTable() {
        String sql = """
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE SPARK_USER_ROLE (
                    id NUMBER(19) NOT NULL,
                    user_id NUMBER(19) NOT NULL,
                    role_id NUMBER(19) NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    assigned_by VARCHAR2(100),
                    expires_at TIMESTAMP,
                    active NUMBER(1) DEFAULT 1,
                    is_primary NUMBER(1) DEFAULT 0,
                    notes VARCHAR2(500),
                    CONSTRAINT pk_spark_user_role PRIMARY KEY (id),
                    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES SPARK_USER(id),
                    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES SPARK_ROLE(id),
                    CONSTRAINT uk_user_role UNIQUE (user_id, role_id),
                    CONSTRAINT chk_user_role_active CHECK (active IN (0, 1)),
                    CONSTRAINT chk_user_role_primary CHECK (is_primary IN (0, 1))
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN
                        RAISE;
                    END IF;
            END;
            """;
        
        jdbcTemplate.execute(sql);
        logger.info("SPARK_USER_ROLE table creation attempted");
    }
    
    private void updateRoleTable() {
        // Add new columns to SPARK_ROLE table if they don't exist
        String[] alterStatements = {
            "ALTER TABLE SPARK_ROLE ADD display_name VARCHAR2(100)",
            "ALTER TABLE SPARK_ROLE ADD color VARCHAR2(7)",
            "ALTER TABLE SPARK_ROLE ADD priority NUMBER(10)",
            "ALTER TABLE SPARK_ROLE ADD system_role NUMBER(1) DEFAULT 0",
            "ALTER TABLE SPARK_ROLE ADD created_by VARCHAR2(100)",
            "ALTER TABLE SPARK_ROLE ADD updated_by VARCHAR2(100)"
        };
        
        for (String statement : alterStatements) {
            try {
                jdbcTemplate.execute(statement);
                logger.info("Executed: " + statement);
            } catch (Exception e) {
                // Column might already exist - this is OK
                logger.info("Skipped (column might exist): " + statement);
            }
        }
        
        // Add check constraint for system_role
        try {
            jdbcTemplate.execute("ALTER TABLE SPARK_ROLE ADD CONSTRAINT chk_role_system CHECK (system_role IN (0, 1))");
        } catch (Exception e) {
            logger.info("Constraint might already exist: chk_role_system");
        }
    }
}