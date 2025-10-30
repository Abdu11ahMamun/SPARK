package com.mislbd.spark.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Starting RBAC database initialization...");
        
        try {
            // Create RBAC tables if they don't exist
            createRBACTables();
            
            // Populate tables with initial data
            populateInitialData();
            
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
            
            // 5. Create SPARK_USER_SESSION_METADATA table
            createUserSessionMetadataTable();
            
            // 6. Update SPARK_ROLE table with new columns
            updateRoleTable();
            
            // 7. Create indexes
            createIndexes();
            
        } catch (Exception e) {
            logger.warning("Some DDL operations failed (this is normal if tables already exist): " + e.getMessage());
        }
        
        // Always try to update session metadata table schema (even if tables already exist)
        try {
            logger.info("Updating session metadata table schema...");
            updateSessionMetadataTable();
            logger.info("Session metadata table schema update completed");
        } catch (Exception e) {
            logger.warning("Session metadata table schema update failed: " + e.getMessage());
        }
    }
    
    private void createSequences() {
        String[] sequences = {
            "CREATE SEQUENCE SEQ_SPARK_PERMISSION START WITH 1 INCREMENT BY 1 NOCACHE",
            "CREATE SEQUENCE SEQ_SPARK_ROLE_PERMISSION START WITH 1 INCREMENT BY 1 NOCACHE",
            "CREATE SEQUENCE SEQ_SPARK_USER_ROLE START WITH 1 INCREMENT BY 1 NOCACHE",
            "CREATE SEQUENCE SEQ_SPARK_SESSION_METADATA START WITH 1 INCREMENT BY 1 NOCACHE"
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
            "CREATE INDEX idx_user_role_active ON SPARK_USER_ROLE(active)",
            "CREATE INDEX idx_session_token ON SPARK_USER_SESSION_METADATA(session_token)",
            "CREATE INDEX idx_session_user_active ON SPARK_USER_SESSION_METADATA(user_id, active)",
            "CREATE INDEX idx_session_expires_at ON SPARK_USER_SESSION_METADATA(expires_at)",
            "CREATE INDEX idx_session_last_activity ON SPARK_USER_SESSION_METADATA(last_activity_at)",
            "CREATE INDEX idx_session_device_type ON SPARK_USER_SESSION_METADATA(device_type)"
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
    
    private void createUserSessionMetadataTable() {
        String sql = """
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE SPARK_USER_SESSION_METADATA (
                    id NUMBER(19) NOT NULL,
                    user_id NUMBER(19) NOT NULL,
                    username VARCHAR2(100) NOT NULL,
                    session_token VARCHAR2(255) NOT NULL,
                    roles_json CLOB,
                    permissions_json CLOB,
                    resources_json CLOB,
                    primary_role VARCHAR2(100),
                    display_name VARCHAR2(150),
                    email VARCHAR2(255),
                    is_admin NUMBER(1) DEFAULT 0,
                    is_system_admin NUMBER(1) DEFAULT 0,
                    permissions_count NUMBER(10),
                    roles_count NUMBER(10),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    active NUMBER(1) DEFAULT 1,
                    ip_address VARCHAR2(45),
                    user_agent VARCHAR2(500),
                    device_type VARCHAR2(20) DEFAULT ''Web'',
                    login_source VARCHAR2(20) DEFAULT ''Manual'',
                    notes VARCHAR2(500),
                    CONSTRAINT pk_spark_session_metadata PRIMARY KEY (id),
                    CONSTRAINT fk_session_metadata_user FOREIGN KEY (user_id) REFERENCES SPARK_USER(id),
                    CONSTRAINT uk_session_token UNIQUE (session_token),
                    CONSTRAINT chk_session_active CHECK (active IN (0, 1)),
                    CONSTRAINT chk_session_is_admin CHECK (is_admin IN (0, 1)),
                    CONSTRAINT chk_session_is_system_admin CHECK (is_system_admin IN (0, 1))
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN
                        RAISE;
                    END IF;
            END;
            """;
        
        jdbcTemplate.execute(sql);
        logger.info("SPARK_USER_SESSION_METADATA table creation attempted");
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

    private void updateSessionMetadataTable() {
        // Add missing columns to SPARK_USER_SESSION_METADATA table if they don't exist
        String[] alterStatements = {
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD username VARCHAR2(100)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD roles_count NUMBER(10)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD permissions_count NUMBER(10)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD roles_json CLOB",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD permissions_json CLOB", 
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD resources_json CLOB",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD primary_role VARCHAR2(100)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD display_name VARCHAR2(150)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD email VARCHAR2(255)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD is_admin NUMBER(1) DEFAULT 0",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD is_system_admin NUMBER(1) DEFAULT 0",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD ip_address VARCHAR2(45)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD user_agent VARCHAR2(500)",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD device_type VARCHAR2(20) DEFAULT 'Web'",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD login_source VARCHAR2(20) DEFAULT 'Manual'",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD notes VARCHAR2(500)"
        };
        
        for (String statement : alterStatements) {
            try {
                jdbcTemplate.execute(statement);
                logger.info("Added missing column to session metadata table: " + statement);
            } catch (Exception e) {
                // Column might already exist - this is OK
                logger.info("Skipped (column might exist): " + statement.substring(0, Math.min(statement.length(), 80)) + "... - " + e.getMessage());
            }
        }
        
        // Add constraints for the new columns
        String[] constraintStatements = {
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD CONSTRAINT chk_session_is_admin CHECK (is_admin IN (0, 1))",
            "ALTER TABLE SPARK_USER_SESSION_METADATA ADD CONSTRAINT chk_session_is_system_admin CHECK (is_system_admin IN (0, 1))"
        };
        
        for (String statement : constraintStatements) {
            try {
                jdbcTemplate.execute(statement);
                logger.info("Added constraint to session metadata table: " + statement);
            } catch (Exception e) {
                logger.info("Skipped constraint (might exist): " + e.getMessage());
            }
        }
    }

    /**
     * Populate database with initial RBAC data if tables are empty
     */
    private void populateInitialData() {
        try {
            // Check if permissions already exist
            Integer permissionCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM SPARK_PERMISSION", Integer.class);
            if (permissionCount == null || permissionCount == 0) {
                createDefaultPermissions();
                logger.info("Default permissions created");
            } else {
                logger.info("Permissions already exist, skipping default data creation");
            }
            
            // Check if any users exist
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM SPARK_USER", Integer.class);
            if (userCount == null || userCount == 0) {
                createDefaultUsers();
                logger.info("Default users created");
            } else {
                logger.info("Users already exist, skipping default user creation");
            }
            
            // Always run user role migration to ensure SPARK_USER_ROLE table is populated
            migrateUserRolesToUserRoleTable();
            
        } catch (Exception e) {
            logger.info("Error populating initial data: " + e.getMessage());
        }
    }
    
    /**
     * Create default permissions for the system
     */
    private void createDefaultPermissions() {
        String[] defaultPermissions = {
            // Dashboard permissions
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'DASHBOARD_VIEW', 'View Dashboard', 'Access main dashboard page', 'Dashboard', 'view', 'Dashboard', 10, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'DASHBOARD_EDIT', 'Edit Dashboard', 'Modify dashboard settings', 'Dashboard', 'edit', 'Dashboard', 20, 1, 1)",
            
            // User management permissions
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'USER_VIEW', 'View Users', 'View user list and profiles', 'Users', 'view', 'User Management', 100, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'USER_CREATE', 'Create User', 'Create new user accounts', 'Users', 'create', 'User Management', 110, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'USER_EDIT', 'Edit User', 'Modify user information', 'Users', 'edit', 'User Management', 120, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'USER_DELETE', 'Delete User', 'Remove user accounts', 'Users', 'delete', 'User Management', 130, 1, 1)",
            
            // Role management permissions
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'ROLE_VIEW', 'View Roles', 'View roles and permissions', 'Roles', 'view', 'Role Management', 200, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'ROLE_MANAGE', 'Manage Roles', 'Create and modify roles', 'Roles', 'manage', 'Role Management', 210, 1, 1)",
            
            // Team management permissions
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'TEAM_VIEW', 'View Teams', 'View team information', 'Teams', 'view', 'Team Management', 300, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'TEAM_MANAGE', 'Manage Teams', 'Create and manage teams', 'Teams', 'manage', 'Team Management', 310, 1, 1)",
            
            // Project management permissions
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'PROJECT_VIEW', 'View Projects', 'View project details', 'Projects', 'view', 'Project Management', 400, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'PROJECT_CREATE', 'Create Project', 'Create new projects', 'Projects', 'create', 'Project Management', 410, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'PROJECT_EDIT', 'Edit Project', 'Modify project settings', 'Projects', 'edit', 'Project Management', 420, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'PROJECT_DELETE', 'Delete Project', 'Remove projects', 'Projects', 'delete', 'Project Management', 430, 1, 1)",
            
            // Task management permissions
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'TASK_VIEW', 'View Tasks', 'View task information', 'Tasks', 'view', 'Task Management', 500, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'TASK_CREATE', 'Create Task', 'Create new tasks', 'Tasks', 'create', 'Task Management', 510, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'TASK_EDIT', 'Edit Task', 'Modify task details', 'Tasks', 'edit', 'Task Management', 520, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'TASK_DELETE', 'Delete Task', 'Remove tasks', 'Tasks', 'delete', 'Task Management', 530, 1, 1)",
            
            // Admin permissions
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'ADMIN_ACCESS', 'Admin Access', 'Access admin panel', 'Admin', 'access', 'Administration', 900, 1, 1)",
            "INSERT INTO SPARK_PERMISSION (id, code, name, description, \"resource\", \"action\", category, display_order, active, system_permission) VALUES (SEQ_SPARK_PERMISSION.NEXTVAL, 'ADMIN_SETTINGS', 'System Settings', 'Modify system settings', 'Admin', 'settings', 'Administration', 910, 1, 1)"
        };
        
        for (String sql : defaultPermissions) {
            try {
                jdbcTemplate.update(sql);
            } catch (Exception e) {
                logger.info("Permission might already exist: " + e.getMessage());
            }
        }
        
        logger.info("Default permissions inserted successfully");
    }
    
    /**
     * Create default users for the system
     */
    private void createDefaultUsers() {
        String[] defaultUsers = {
            // Admin user
            String.format("INSERT INTO SPARK_USER (id, firstName, lastName, username, password, email, role, activeStatus, createdate) VALUES (1, 'System', 'Admin', 'admin', '%s', 'admin@spark.local', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP)", passwordEncoder.encode("admin123")),
            // Test user
            String.format("INSERT INTO SPARK_USER (id, firstName, lastName, username, password, email, role, activeStatus, createdate) VALUES (2, 'Test', 'User', 'testuser', '%s', 'test@spark.local', 'USER', 'ACTIVE', CURRENT_TIMESTAMP)", passwordEncoder.encode("test123")),
            // Demo user with common credentials
            String.format("INSERT INTO SPARK_USER (id, firstName, lastName, username, password, email, role, activeStatus, createdate) VALUES (3, 'Demo', 'User', 'demo', '%s', 'demo@spark.local', 'USER', 'ACTIVE', CURRENT_TIMESTAMP)", passwordEncoder.encode("demo")),
            String.format("INSERT INTO SPARK_USER (id, firstName, lastName, username, password, email, role, activeStatus, createdate) VALUES (4, 'Mamun', 'Khan', 'mamun', '%s', 'mamun@spark.local', 'USER', 'ACTIVE', CURRENT_TIMESTAMP)", passwordEncoder.encode("a")),
            String.format("INSERT INTO SPARK_USER (id, firstName, lastName, username, password, email, role, activeStatus, createdate) VALUES (5, 'Nayem', 'Ahmed', 'nayem', '%s', 'nayem@spark.local', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP)", passwordEncoder.encode("1234"))
        };
        
        for (String sql : defaultUsers) {
            try {
                jdbcTemplate.update(sql);
            } catch (Exception e) {
                logger.info("User might already exist: " + e.getMessage());
            }
        }
        
        logger.info("Default users inserted successfully");
    }
    
    /**
     * Migrate user roles from SPARK_USER.role field to SPARK_USER_ROLE table
     * This ensures the RBAC system works properly
     */
    private void migrateUserRolesToUserRoleTable() {
        logger.info("Migrating user roles to SPARK_USER_ROLE table...");
        
        try {
            // First, create default roles if they don't exist (with MERGE to avoid duplicates)
            String[] defaultRolesMerge = {
                "MERGE INTO SPARK_ROLE r USING (SELECT 'ADMIN' as name, 'Administrator with full system access' as description FROM DUAL) d ON (r.name = d.name) WHEN NOT MATCHED THEN INSERT (id, name, description, active) VALUES (1, d.name, d.description, 1)",
                "MERGE INTO SPARK_ROLE r USING (SELECT 'USER' as name, 'Regular user with basic access' as description FROM DUAL) d ON (r.name = d.name) WHEN NOT MATCHED THEN INSERT (id, name, description, active) VALUES (2, d.name, d.description, 1)",
                "MERGE INTO SPARK_ROLE r USING (SELECT 'MANAGER' as name, 'Manager with team management access' as description FROM DUAL) d ON (r.name = d.name) WHEN NOT MATCHED THEN INSERT (id, name, description, active) VALUES (3, d.name, d.description, 1)",
                "MERGE INTO SPARK_ROLE r USING (SELECT 'DEVELOPER' as name, 'Developer with development access' as description FROM DUAL) d ON (r.name = d.name) WHEN NOT MATCHED THEN INSERT (id, name, description, active) VALUES (4, d.name, d.description, 1)"
            };
            
            for (String sql : defaultRolesMerge) {
                try {
                    jdbcTemplate.update(sql);
                } catch (Exception e) {
                    logger.info("Role might already exist: " + e.getMessage());
                }
            }
            
            // Check existing user-role mappings to avoid duplicates
            Integer existingMappings = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM SPARK_USER_ROLE", Integer.class);
            if (existingMappings == null) existingMappings = 0;
            
            logger.info("Found " + existingMappings + " existing user-role mappings");
            
            // Only migrate if we have few or no existing mappings
            if (existingMappings < 5) {
                // Use MERGE to avoid primary key violations
                String migrationSQL = """
                    MERGE INTO SPARK_USER_ROLE ur
                    USING (
                        SELECT 
                            u.id as user_id,
                            r.id as role_id,
                            1 as active,
                            1 as is_primary,
                            CURRENT_TIMESTAMP as assigned_at,
                            'SYSTEM' as assigned_by
                        FROM SPARK_USER u
                        INNER JOIN SPARK_ROLE r ON UPPER(u.role) = UPPER(r.name)
                        WHERE u.role IS NOT NULL
                    ) src ON (ur.user_id = src.user_id AND ur.role_id = src.role_id)
                    WHEN NOT MATCHED THEN 
                        INSERT (id, user_id, role_id, active, is_primary, assigned_at, assigned_by)
                        VALUES (SEQ_SPARK_USER_ROLE.NEXTVAL, src.user_id, src.role_id, src.active, src.is_primary, src.assigned_at, src.assigned_by)
                    """;
                
                int migratedCount = jdbcTemplate.update(migrationSQL);
                logger.info("Migrated " + migratedCount + " user-role assignments using MERGE");
            } else {
                logger.info("Skipping migration, sufficient mappings already exist");
            }
            
            // Verify migration results
            Integer finalMappings = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM SPARK_USER_ROLE", Integer.class);
            if (finalMappings == null) finalMappings = 0;
            logger.info("Total user-role mappings after migration: " + finalMappings);
            
        } catch (Exception e) {
            logger.severe("Failed to migrate user roles: " + e.getMessage());
        }
        
        logger.info("User role migration completed");
    }
}