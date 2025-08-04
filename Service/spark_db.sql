CREATE TABLE SPARK.APP_CONFIG
(
  ID           INTEGER Generated as Identity ( START WITH 21 MAXVALUE 9999999999999999999999999999 MINVALUE 1 NOCYCLE CACHE 20 NOORDER NOKEEP) NOT NULL,
  CONFIG_NAME  VARCHAR2(200 CHAR),
  STATUS       NUMBER(1),
  VALUE        VARCHAR2(200 BYTE)               NOT NULL
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.BACKLOG_TASK
(
  ID                 INTEGER                    NOT NULL,
  TITLE              VARCHAR2(255 BYTE),
  DESCRIPTION        VARCHAR2(1000 BYTE),
  STATUS             VARCHAR2(20 BYTE),
  PRIORITY           VARCHAR2(10 BYTE),
  DEADLINE           DATE,
  CREATEDDATE        TIMESTAMP(6)               DEFAULT CURRENT_TIMESTAMP,
  MODIFIEDDATE       TIMESTAMP(6),
  ASSIGNEDTO         INTEGER,
  SPRINTID           INTEGER,
  PRODUCTID          INTEGER,
  POINTS             INTEGER,
  TASKTYPEID         INTEGER,
  PRODUCT_MODULE_ID  NUMBER,
  PARENT_ID          NUMBER,
  PRIMARY_CLIENT     INTEGER,
  SPTRACKING_ID      VARCHAR2(20 BYTE),
  ISSUE_RACE_VIA     VARCHAR2(2000 BYTE),
  MITS_ID            NUMBER,
  TASK_STATUS        NUMBER(1)                  DEFAULT 1,
  TASK_TYPE          NUMBER                     DEFAULT 1,
  CREATE_BY          VARCHAR2(20 BYTE),
  UPDATE_BY          VARCHAR2(20 BYTE),
  UPDATEDATE         DATE,
  TEAM_ID            NUMBER
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.CLIENT
(
  ID             INTEGER,
  NAME           VARCHAR2(255 BYTE)             NOT NULL,
  CONTACTPERSON  VARCHAR2(255 BYTE),
  EMAIL          VARCHAR2(255 BYTE),
  PHONE          VARCHAR2(20 BYTE),
  STATUS         VARCHAR2(20 BYTE),
  CREATEDDATE    TIMESTAMP(6)                   DEFAULT CURRENT_TIMESTAMP
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.HTMLDB_PLAN_TABLE
(
  STATEMENT_ID       VARCHAR2(30 BYTE),
  PLAN_ID            NUMBER,
  TIMESTAMP          DATE,
  REMARKS            VARCHAR2(4000 BYTE),
  OPERATION          VARCHAR2(30 BYTE),
  OPTIONS            VARCHAR2(255 BYTE),
  OBJECT_NODE        VARCHAR2(128 BYTE),
  OBJECT_OWNER       VARCHAR2(128 BYTE),
  OBJECT_NAME        VARCHAR2(128 BYTE),
  OBJECT_ALIAS       VARCHAR2(261 BYTE),
  OBJECT_INSTANCE    INTEGER,
  OBJECT_TYPE        VARCHAR2(128 BYTE),
  OPTIMIZER          VARCHAR2(255 BYTE),
  SEARCH_COLUMNS     NUMBER,
  ID                 INTEGER,
  PARENT_ID          INTEGER,
  DEPTH              INTEGER,
  POSITION           INTEGER,
  COST               INTEGER,
  CARDINALITY        INTEGER,
  BYTES              INTEGER,
  OTHER_TAG          VARCHAR2(255 BYTE),
  PARTITION_START    VARCHAR2(255 BYTE),
  PARTITION_STOP     VARCHAR2(255 BYTE),
  PARTITION_ID       INTEGER,
  OTHER              LONG,
  DISTRIBUTION       VARCHAR2(30 BYTE),
  CPU_COST           INTEGER,
  IO_COST            INTEGER,
  TEMP_SPACE         INTEGER,
  ACCESS_PREDICATES  VARCHAR2(4000 BYTE),
  FILTER_PREDICATES  VARCHAR2(4000 BYTE),
  PROJECTION         VARCHAR2(4000 BYTE),
  TIME               INTEGER,
  QBLOCK_NAME        VARCHAR2(128 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.JOB_TYPE
(
  ID           INTEGER,
  TYPE         VARCHAR2(255 BYTE)               NOT NULL,
  DESCRIPTION  VARCHAR2(500 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.MITS_DOCUMENTS
(
  ID           INTEGER Generated as Identity ( START WITH 101 MAXVALUE 9999999999999999999999999999 MINVALUE 1 NOCYCLE CACHE 20 NOORDER NOKEEP) NOT NULL,
  MITS         NUMBER,
  DESCRIPTION  VARCHAR2(1000 BYTE),
  DOCUMENT     BLOB,
  FILE_NAME    VARCHAR2(200 BYTE),
  MIMETYPE     VARCHAR2(200 BYTE),
  CREATEDAT    TIMESTAMP(6)                     DEFAULT CURRENT_TIMESTAMP,
  UPDATEDAT    TIMESTAMP(6)
)
LOB (DOCUMENT) STORE AS SECUREFILE (
  TABLESPACE  APEX_1397035903883537
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          256K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.NUMBER_TO_BANGLA
(
  NUM          NUMBER,
  BANGLA_WORD  VARCHAR2(50 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.RETRO_INFO
(
  ID           NUMBER,
  SPRINT_ID    NUMBER,
  USER_ID      NUMBER,
  QUESTION1    VARCHAR2(100 BYTE),
  ANSWER1      VARCHAR2(1500 BYTE),
  QUESTION2    VARCHAR2(100 BYTE),
  ANSWER2      VARCHAR2(1500 BYTE),
  COMMENTS     VARCHAR2(2000 BYTE),
  CREATE_BY    VARCHAR2(10 BYTE),
  CREATE_TIME  DATE                             DEFAULT SYSDATE,
  STATUS       NUMBER                           DEFAULT 1
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.RND
(
  ID     NUMBER,
  TEST   VARCHAR2(200 BYTE),
  TEST2  VARCHAR2(100 BYTE),
  FFF    VARCHAR2(10 BYTE),
  RRR    VARCHAR2(10 BYTE),
  RERR   VARCHAR2(10 BYTE),
  ERR    VARCHAR2(10 BYTE),
  ER     VARCHAR2(10 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.ROLE_RIGHTS
(
  ID         NUMBER Generated as Identity ( START WITH 7 MAXVALUE 9999999999999999999999999999 MINVALUE 1 NOCYCLE CACHE 20 NOORDER NOKEEP) NOT NULL,
  ROLE_NAME  VARCHAR2(100 BYTE),
  PAGE_LIST  VARCHAR2(500 BYTE),
  STATUS     NUMBER                             DEFAULT 1
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.SPRINT_INFO
(
  ID              NUMBER,
  SPRINT_NAME     VARCHAR2(100 BYTE),
  NO_OF_HOLIDAYS  NUMBER,
  FROM_DATE       DATE,
  TO_DATE         DATE,
  TRAM_ID         NUMBER,
  SPRINT_POINT    NUMBER,
  SPRINT_ARCHIVE  NUMBER,
  DETAILS_REMARK  VARCHAR2(1000 BYTE),
  CREATE_BY       VARCHAR2(10 BYTE),
  CREATE_TIME     DATE                          DEFAULT SYSDATE,
  STATUS          NUMBER                        DEFAULT 1,
  COMMENTS        CLOB,
  SPRINT_OUTCOME  CLOB
)
LOB (SPRINT_OUTCOME) STORE AS SECUREFILE (
  TABLESPACE  APEX_1397035903883537
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          256K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOB (COMMENTS) STORE AS SECUREFILE (
  TABLESPACE  APEX_1397035903883537
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          256K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.SPRINT_USER_INFO
(
  ID             NUMBER,
  SPRINT_ID      NUMBER,
  USER_ID        NUMBER,
  LEAVE_DAYS     NUMBER,
  CREATE_BY      VARCHAR2(10 BYTE),
  CREATE_TIME    DATE                           DEFAULT SYSDATE,
  USER_CAPACITY  NUMBER                         DEFAULT 100
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


--  There is no statement for index SPARK.SYS_C0072096.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072073.
--  The object is created when the parent object is created.

CREATE UNIQUE INDEX SPARK.PK_MITS_DOCUMENTS ON SPARK.MITS_DOCUMENTS
(ID)
LOGGING
NOPARALLEL;


--  There is no statement for index SPARK.SYS_C0092803.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0092802.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0088428.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0087875.
--  The object is created when the parent object is created.

CREATE TABLE SPARK.APPUSER
(
  ID             NUMBER Generated as Identity ( START WITH 275 MAXVALUE 9999999999999999999999999999 MINVALUE 1 NOCYCLE CACHE 20 NOORDER NOKEEP) NOT NULL,
  NAME           VARCHAR2(255 BYTE)             NOT NULL,
  USERNAME       VARCHAR2(50 BYTE)              NOT NULL,
  PASSWORD       VARCHAR2(255 BYTE),
  EMAIL          VARCHAR2(255 BYTE)             NOT NULL,
  EMAILVERIFIED  CHAR(1 BYTE)                   DEFAULT 'N',
  ACTIVESTATUS   CHAR(1 BYTE)                   DEFAULT 'Y',
  ROLE           VARCHAR2(20 BYTE)              NOT NULL,
  TEAMID         NUMBER,
  CREATEDATE     TIMESTAMP(6)                   DEFAULT CURRENT_TIMESTAMP,
  UPDATEDATE     TIMESTAMP(6)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.PRODUCT
(
  ID                  INTEGER                   DEFAULT "SPARK"."PRODUCT_SEQUENCE"."NEXTVAL",
  NAME                VARCHAR2(255 BYTE),
  STATUS              VARCHAR2(20 BYTE),
  VISION              CLOB,
  VERSION             VARCHAR2(50 BYTE),
  CURRENT_RELEASE     VARCHAR2(50 BYTE),
  PRODUCT_OWNER_ID    NUMBER,
  DEPENDENT_PRODUCTS  NUMBER                    DEFAULT 1,
  CLIENT              VARCHAR2(255 BYTE)
)
LOB (VISION) STORE AS SECUREFILE (
  TABLESPACE  APEX_1397035903883537
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          256K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.PRODUCT_MODULE
(
  ID               INTEGER                      DEFAULT "SPARK"."PRODUCT_MODULE_SEQUENCE"."NEXTVAL",
  NAME             VARCHAR2(255 BYTE),
  PRODUCT_ID       INTEGER,
  RELEASE          VARCHAR2(50 BYTE),
  MODULE_STATUS    VARCHAR2(20 BYTE),
  MODULE_OWNER_ID  NUMBER,
  CLIENT           NUMBER
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.SPRINT_TASK_LOG
(
  ID                 INTEGER,
  TASKID             INTEGER,
  PRODUCTID          INTEGER,
  CLIENTID           INTEGER,
  JOBTYPEID          INTEGER,
  USER_ID            INTEGER,
  CREATEDDATE        TIMESTAMP(6)               DEFAULT CURRENT_TIMESTAMP,
  DEADLINE           TIMESTAMP(6),
  EST_TIME           NUMBER,
  REMARKS            VARCHAR2(255 BYTE),
  SPRINT_ID          NUMBER,
  END_DATE           DATE,
  USERSP_POINT       NUMBER,
  STATUS             NUMBER                     DEFAULT 0,
  ACTUAL_HOURS       NUMBER,
  COMMENTS           VARCHAR2(2000 BYTE),
  LAST_COMMENT_DATE  DATE,
  TASK_POINTS        NUMBER,
  RE_ASSIGNED        NUMBER
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE TABLE SPARK.TEAM
(
  ID           INTEGER                          DEFAULT "SPARK"."TEAM_SEQUENCE"."NEXTVAL",
  TEAMNAME     VARCHAR2(100 BYTE)               NOT NULL,
  DESCRIPTION  VARCHAR2(255 BYTE),
  CREATEDAT    TIMESTAMP(6)                     DEFAULT CURRENT_TIMESTAMP,
  UPDATEDAT    TIMESTAMP(6),
  STATUS       NUMBER                           DEFAULT 1,
  POWNER       NUMBER,
  SMASTER      NUMBER
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


CREATE UNIQUE INDEX SPARK.APPUSER_PK ON SPARK.APPUSER
(ID)
LOGGING
NOPARALLEL;


--  There is no statement for index SPARK.SYS_C0072040.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072050.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072081.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072070.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072097.
--  The object is created when the parent object is created.

CREATE UNIQUE INDEX SPARK.SPRINT_TASK_LOG_U01 ON SPARK.SPRINT_TASK_LOG
(TASKID, USER_ID, JOBTYPEID, SPRINT_ID)
LOGGING
NOPARALLEL;


--  There is no statement for index SPARK.SYS_C0072049.
--  The object is created when the parent object is created.

ALTER TABLE SPARK.CLIENT ADD (
  CHECK (Status IN ('Active', 'Inactive', 'Expired'))
  ENABLE VALIDATE,
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.JOB_TYPE ADD (
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.MITS_DOCUMENTS ADD (
  CONSTRAINT PK_MITS_DOCUMENTS
  PRIMARY KEY
  (ID)
  USING INDEX SPARK.PK_MITS_DOCUMENTS
  ENABLE VALIDATE);

ALTER TABLE SPARK.NUMBER_TO_BANGLA ADD (
  PRIMARY KEY
  (NUM)
  ENABLE VALIDATE);

ALTER TABLE SPARK.RETRO_INFO ADD (
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.SPRINT_INFO ADD (
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.SPRINT_USER_INFO ADD (
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.APPUSER ADD (
  CONSTRAINT CHK_ACTIVESTATUS
  CHECK (ACTIVESTATUS IN ('Y', 'N'))
  ENABLE VALIDATE,
  CONSTRAINT CHK_ROLE
  CHECK (ROLE IN ('ADMIN', 'GUEST', 'PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER', 'TESTER', 'RELEASE_MANAGER', 'SUPPORT'))
  ENABLE VALIDATE,
  CONSTRAINT APPUSER_PK
  PRIMARY KEY
  (ID)
  USING INDEX SPARK.APPUSER_PK
  ENABLE VALIDATE,
  UNIQUE (USERNAME)
  ENABLE VALIDATE,
  UNIQUE (EMAIL)
  ENABLE VALIDATE);

ALTER TABLE SPARK.PRODUCT ADD (
  CHECK (status IN ('active', 'inactive', 'expired'))
  ENABLE VALIDATE,
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.PRODUCT_MODULE ADD (
  CHECK (module_status IN ('active', 'inactive', 'expired'))
  ENABLE VALIDATE,
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.SPRINT_TASK_LOG ADD (
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE,
  CONSTRAINT SPRINT_TASK_LOG_U01
  UNIQUE (TASKID, USER_ID, JOBTYPEID, SPRINT_ID)
  USING INDEX SPARK.SPRINT_TASK_LOG_U01
  ENABLE VALIDATE);

ALTER TABLE SPARK.TEAM ADD (
  PRIMARY KEY
  (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.APPUSER ADD (
  CONSTRAINT FK_USER_TEAM 
  FOREIGN KEY (TEAMID) 
  REFERENCES SPARK.TEAM (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.PRODUCT ADD (
  CONSTRAINT FK_DEPENDENT_PRODUCTS 
  FOREIGN KEY (DEPENDENT_PRODUCTS) 
  REFERENCES SPARK.PRODUCT (ID)
  DISABLE NOVALIDATE,
  CONSTRAINT FK_PRODUCT_OWNER 
  FOREIGN KEY (PRODUCT_OWNER_ID) 
  REFERENCES SPARK.APPUSER (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.PRODUCT_MODULE ADD (
  CONSTRAINT FK_MODULE_CLIENT 
  FOREIGN KEY (CLIENT) 
  REFERENCES SPARK.CLIENT (ID)
  ON DELETE CASCADE
  ENABLE VALIDATE,
  CONSTRAINT FK_PRODUCT_MODULE_OWNER 
  FOREIGN KEY (MODULE_OWNER_ID) 
  REFERENCES SPARK.APPUSER (ID)
  ENABLE VALIDATE,
  CONSTRAINT FK_PRODUCT_MODULE_PRODUCT 
  FOREIGN KEY (PRODUCT_ID) 
  REFERENCES SPARK.PRODUCT (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.SPRINT_TASK_LOG ADD (
  CONSTRAINT FK_SPRINT_CLIENT 
  FOREIGN KEY (CLIENTID) 
  REFERENCES SPARK.CLIENT (ID)
  ENABLE VALIDATE,
  CONSTRAINT FK_SPRINT_JOB_TYPE 
  FOREIGN KEY (JOBTYPEID) 
  REFERENCES SPARK.JOB_TYPE (ID)
  ENABLE VALIDATE,
  CONSTRAINT FK_SPRINT_POINT_PERSON 
  FOREIGN KEY (USER_ID) 
  REFERENCES SPARK.APPUSER (ID)
  ENABLE VALIDATE,
  CONSTRAINT FK_SPRINT_PRODUCT 
  FOREIGN KEY (PRODUCTID) 
  REFERENCES SPARK.PRODUCT (ID)
  ENABLE VALIDATE);

ALTER TABLE SPARK.TEAM ADD (
  CONSTRAINT TEAM_CON_PO 
  FOREIGN KEY (POWNER) 
  REFERENCES SPARK.APPUSER (ID)
  ON DELETE CASCADE
  ENABLE VALIDATE,
  CONSTRAINT TEAM_CON_SM 
  FOREIGN KEY (SMASTER) 
  REFERENCES SPARK.APPUSER (ID)
  ON DELETE CASCADE
  ENABLE VALIDATE);

--
-- Note: 
-- The following objects may not be sorted properly in the script due to cirular references
--
--  APPUSER  (Table) 
--  PRODUCT  (Table) 
--  PRODUCT_MODULE  (Table) 
--  SPRINT_TASK_LOG  (Table) 
--  TEAM  (Table) 
--  APPUSER_PK  (Index) 
--  SYS_C0072040  (Index) 
--  SYS_C0072050  (Index) 
--  SYS_C0072081  (Index) 
--  SYS_C0072070  (Index) 
--  SYS_C0072097  (Index) 
--  SPRINT_TASK_LOG_U01  (Index) 
--  SYS_C0072049  (Index)
/* Formatted on 5/22/2025 2:46:31 PM (QP5 v5.256.13226.35538) */
CREATE OR REPLACE FORCE VIEW SPARK.SP_CALCULATOR_VW
(
   SL,
   WEIGHT,
   TASK_COMPLEXITY,
   AMOUNT_OF_EFFORTS_REQUIRED,
   TASK_RISK_UNCERTAINITY_DEPENDENCIES,
   STORY_POINTS
)
   BEQUEATH DEFINER
AS
   SELECT 1 sl,
          1 AS Weight,
          'Minimun-1' AS Task_Complexity,
          'Little-1' AS Amount_of_Efforts_Required,
          'None-1' AS Task_Risk_Uncertainity_Dependencies,
          0 AS Story_points
     FROM DUAL
   UNION ALL
   SELECT 2 sl,
          2 AS Weight,
          'Minimum-2' AS Task_Complexity,
          'Little-2' AS Amount_of_Efforts_Required,
          'None-2' AS Task_Risk_Uncertainity_Dependencies,
          0 AS Story_points
     FROM DUAL
   UNION ALL
   SELECT 3 sl,
          3 AS Weight,
          'Mid' AS Task_Complexity,
          'Low' AS Amount_of_Efforts_Required,
          'Low' AS Task_Risk_Uncertainity_Dependencies,
          0 AS Story_points
     FROM DUAL
   UNION ALL
   SELECT 4 sl,
          5 AS Weight,
          'Moderate' AS Task_Complexity,
          'Medium-1' AS Amount_of_Efforts_Required,
          'Moderate-1' AS Task_Risk_Uncertainity_Dependencies,
          0 AS Story_points
     FROM DUAL
   UNION ALL
   SELECT 5 sl,
          8 AS Weight,
          'Severe' AS Task_Complexity,
          'Medium-2' AS Amount_of_Efforts_Required,
          'Moderate-2' AS Task_Risk_Uncertainity_Dependencies,
          0 AS Story_points
     FROM DUAL
   UNION ALL
   SELECT 6 sl,
          13 AS Weight,
          'Maximum' AS Task_Complexity,
          'High' AS Amount_of_Efforts_Required,
          'High' AS Task_Risk_Uncertainity_Dependencies,
          0 AS Story_points
     FROM DUAL
   UNION ALL
   SELECT 7 sl,
          NULL AS Weight,
          '0' AS Task_Complexity,
          '0' AS Amount_of_Efforts_Required,
          '0' AS Task_Risk_Uncertainity_Dependencies,
          0 AS Story_points
     FROM DUAL;


/* Formatted on 5/22/2025 2:46:31 PM (QP5 v5.256.13226.35538) */
CREATE OR REPLACE FORCE VIEW SPARK.VW_ROLE_RIGHTS
(
   ID,
   ROLE_NAME,
   PAGE_LIST
)
   BEQUEATH DEFINER
AS
   SELECT q.id, q.role_name, TO_NUMBER (s.COLUMN_VALUE) AS PAGE_LIST
     FROM ROLE_RIGHTS q, APEX_STRING.split (
q.PAGE_LIST, ':') s
    ORDER BY q.id, TO_NUMBER (s.COLUMN_VALUE);
CREATE OR REPLACE PROCEDURE SPARK.prc_wsdl_soap_api_add_notes (
    P_USER_NAME    IN VARCHAR2,
    P_PASSWORD     IN VARCHAR2,
    P_ISSUE_NO     IN NUMBER,
    P_ISSUE_NOTE   IN VARCHAR2)
IS
    l_envelope   CLOB;
    l_xml        XMLTYPE;
    V_ERROR      VARCHAR2 (4000);
   BEGIN
    -- Build a SOAP document appropriate for the web service.
    l_envelope :=
           '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:man="http://futureware.biz/mantisconnect">
   <soapenv:Header/>
   <soapenv:Body>
      <man:mc_issue_note_add soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">'
        || P_USER_NAME
        || '</username>
         <password xsi:type="xsd:string">'
        || P_PASSWORD
        || '</password>
         <issue_id xsi:type="xsd:integer">'
        || P_ISSUE_NO
        || '</issue_id>
         <note xsi:type="man:IssueNoteData">
            <!--You may enter the following 9 items in any order-->
            <!--Optional:-->
            <id xsi:type="xsd:integer"></id>
            <!--Optional:-->
            <reporter xsi:type="man:AccountData">
               <!--You may enter the following 4 items in any order-->
               <!--Optional:-->
               <id xsi:type="xsd:integer"></id>
               <!--Optional:-->
               <name xsi:type="xsd:string"></name>
               <!--Optional:-->
               <real_name xsi:type="xsd:string"></real_name>
               <!--Optional:-->
               <email xsi:type="xsd:string"></email>
            </reporter>
            <!--Optional:-->
            <text xsi:type="xsd:string">'
        || P_ISSUE_NOTE
        || '</text>
            <!--Optional:-->
            <view_state xsi:type="man:ObjectRef">
               <!--You may enter the following 2 items in any order-->
               <!--Optional:-->
               <id xsi:type="xsd:integer"></id>
               <!--Optional:-->
               <name xsi:type="xsd:string"></name>
            </view_state>
            <!--Optional:-->
            <date_submitted xsi:type="xsd:dateTime"></date_submitted>
            <!--Optional:-->
            <last_modified xsi:type="xsd:dateTime"></last_modified>
            <!--Optional:-->
            <time_tracking xsi:type="xsd:integer"></time_tracking>
            <!--Optional:-->
            <note_type xsi:type="xsd:integer"></note_type>
            <!--Optional:-->
            <note_attr xsi:type="xsd:string"></note_attr>
         </note>
      </man:mc_issue_note_add>
   </soapenv:Body>
</soapenv:Envelope>';

    -- Get the XML response from the web service.
    l_xml :=
        APEX_WEB_SERVICE.make_request (
            p_url        =>
                'http://192.168.1.126:1234/mantis/api/soap/mantisconnect.php',
            p_action     =>
                'http://192.168.1.126:1234/mantis/api/soap/mantisconnect.php/mc_issue_note_add',
            p_envelope   => l_envelope);

    -- Display the whole SOAP document returned.
    DBMS_OUTPUT.put_line ('l_xml=' || l_xml.getClobVal ());
EXCEPTION
    WHEN OTHERS
    THEN
        V_ERROR := SQLERRM;
END;
/
CREATE UNIQUE INDEX SPARK.APPUSER_PK ON SPARK.APPUSER
(ID)
LOGGING
NOPARALLEL;


CREATE UNIQUE INDEX SPARK.PK_MITS_DOCUMENTS ON SPARK.MITS_DOCUMENTS
(ID)
LOGGING
NOPARALLEL;


CREATE UNIQUE INDEX SPARK.SPRINT_TASK_LOG_U01 ON SPARK.SPRINT_TASK_LOG
(TASKID, USER_ID, JOBTYPEID, SPRINT_ID)
LOGGING
NOPARALLEL;


--  There is no statement for index SPARK.SYS_C0072040.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072049.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072050.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072070.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072073.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072081.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072096.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0072097.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0087875.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0088428.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0092802.
--  The object is created when the parent object is created.

--  There is no statement for index SPARK.SYS_C0092803.
--  The object is created when the parent object is created.
CREATE OR REPLACE PACKAGE SPARK.PKG_DOME_UTILS AS 


--object scripts
FUNCTION f_get_database_object_script(
    p_name varchar2,
    p_type varchar2,
    p_grants_yn varchar2 default 'N'
) RETURN clob;


FUNCTION f_get_app_component_script(
    p_app_no number,
    p_id number,
    p_type varchar2
) RETURN clob;


FUNCTION f_get_app_script(
    p_app_no number
) RETURN clob;


--object lists
FUNCTION f_get_objects_list(
    p_object_type varchar2  --values: ORDS
) RETURN PKG_DOME_INTERFACE.t_objects;

--lock page
FUNCTION f_page_locked_yn(
    p_app_number number,
    p_page_number number
) RETURN varchar2;


END PKG_DOME_UTILS;
/
CREATE SEQUENCE SPARK.APPUSER_SEQ
  START WITH 254
  MAXVALUE 9999999999999999999999999999
  MINVALUE 1
  NOCYCLE
  CACHE 20
  NOORDER
  NOKEEP
  GLOBAL;


CREATE SEQUENCE SPARK.DEPT_SEQ
  START WITH 50
  MAXVALUE 9999999999999999999999999999
  MINVALUE 1
  NOCYCLE
  CACHE 20
  NOORDER
  NOKEEP
  GLOBAL;


CREATE SEQUENCE SPARK.EMP_SEQ
  START WITH 8000
  MAXVALUE 9999999999999999999999999999
  MINVALUE 1
  NOCYCLE
  CACHE 20
  NOORDER
  NOKEEP
  GLOBAL;


-- Sequence ISEQ$$_187594 is created automatically by Oracle for use with an Identity column

-- Sequence ISEQ$$_187791 is created automatically by Oracle for use with an Identity column

-- Sequence ISEQ$$_237958 is created automatically by Oracle for use with an Identity column

-- Sequence ISEQ$$_265813 is created automatically by Oracle for use with an Identity column

-- Sequence ISEQ$$_284819 is created automatically by Oracle for use with an Identity column

CREATE SEQUENCE SPARK.MITS_SEQUENCE
  START WITH 571
  MAXVALUE 9999999999999999999999999999
  MINVALUE 1
  NOCYCLE
  CACHE 20
  NOORDER
  NOKEEP
  GLOBAL;


CREATE SEQUENCE SPARK.PRODUCT_MODULE_SEQUENCE
  START WITH 284
  MAXVALUE 9999999999999999999999999999
  MINVALUE 1
  NOCYCLE
  CACHE 20
  NOORDER
  NOKEEP
  GLOBAL;


CREATE SEQUENCE SPARK.PRODUCT_SEQUENCE
  START WITH 185
  MAXVALUE 9999999999999999999999999999
  MINVALUE 1
  NOCYCLE
  CACHE 20
  NOORDER
  NOKEEP
  GLOBAL;


CREATE SEQUENCE SPARK.TEAM_SEQUENCE
  START WITH 81
  MAXVALUE 9999999999999999999999999999
  MINVALUE 1
  NOCYCLE
  CACHE 20
  NOORDER
  NOKEEP
  GLOBAL;
CREATE OR REPLACE TYPE SPARK.mits_details_type AS OBJECT (
  DESCRIPTION VARCHAR2(1000),
  CLIENT_NAME VARCHAR2(100),
  TASK_TYPE   VARCHAR2(100),
CATEGORY_NAME VARCHAR2(100),
PRIORITY_NAME VARCHAR2(100),
STATUS_NAME   VARCHAR2(50),
PROJECT_NAME  VARCHAR2(150),
SUMMARY       VARCHAR2(500),
ASSIGN_TO     VARCHAR2(100),
DEADLINE       VARCHAR2(100),
MODULE       VARCHAR2(100)
);
/

CREATE OR REPLACE TYPE SPARK.sprint_working_day AS OBJECT (
SL_NUMBER NUMBER,
  sprint_working_day varchar2(30)
);
/

CREATE OR REPLACE TYPE SPARK.sprint_working_tab IS TABLE OF sprint_working_day;
/

CREATE OR REPLACE TYPE SPARK.mits_details_tab IS TABLE OF mits_details_type;
/
