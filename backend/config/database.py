"""
Database configuration module
"""
import MySQLdb
import subprocess
import tempfile
import os
import datetime
from typing import Optional

class DatabaseConfig:
    """Database configuration and connection management"""
    
    def __init__(self):
        self.host = "localhost"
        self.user = "mybackenduser"
        self.password = "password"
        self.database = "cdd_legrigne"
    
    def get_connection(self) -> MySQLdb.Connection:
        """Get database connection"""
        try:
            connection = MySQLdb.connect(
                host=self.host,
                user=self.user,
                passwd=self.password,
                db=self.database
            )
            return connection
        except MySQLdb.Error as e:
            raise Exception(f"Database connection failed: {e}")
    
    def execute_query(self, query: str, params: Optional[tuple] = None):
        """Execute a query and return results"""
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            # If it's a SELECT query, fetch results
            if query.strip().upper().startswith('SELECT'):
                result = cursor.fetchall()
                return result
            else:
                # For INSERT, UPDATE, DELETE
                connection.commit()
                return cursor.rowcount
                
        except MySQLdb.Error as e:
            if connection:
                connection.rollback()
            raise Exception(f"Query execution failed: {e}")
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    def backup_database(self) -> str:
        """Generate a complete SQL backup of the database including structure and data"""
        try:
            # Use mysqldump to create a complete backup
            cmd = [
                'mysqldump',
                f'--host={self.host}',
                f'--user={self.user}',
                f'--password={self.password}',
                '--single-transaction',  # Ensures consistency
                '--routines',            # Include stored procedures and functions
                '--triggers',            # Include triggers
                '--events',              # Include events
                '--add-drop-table',      # Add DROP TABLE statements
                '--create-options',      # Include table creation options
                '--extended-insert',     # Use extended INSERT syntax for efficiency
                '--set-charset',         # Add charset information
                self.database
            ]
            
            # Execute mysqldump and capture output
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            backup_sql = result.stdout
            
            # Process the backup to uncomment view definitions
            lines = backup_sql.split('\n')
            processed_lines = []
            
            for line in lines:
                # Remove MySQL version-specific comment syntax for views
                if line.startswith('/*!50001 ') and line.endswith(' */'):
                    # Extract the actual SQL from the comment
                    processed_line = line[9:-3]  # Remove /*!50001 and */
                    processed_lines.append(processed_line)
                elif line.startswith('/*!50013 ') and line.endswith(' */'):
                    # Extract the actual SQL from the comment
                    processed_line = line[9:-3]  # Remove /*!50013 and */
                    processed_lines.append(processed_line)
                else:
                    processed_lines.append(line)
            
            return '\n'.join(processed_lines)
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"Database backup failed: {e.stderr}")
        except Exception as e:
            raise Exception(f"Database backup error: {str(e)}")
    
    def backup_database_python(self) -> str:
        """Alternative backup method using pure Python (fallback if mysqldump not available)"""
        connection = None
        cursor = None
        sql_backup = []
        
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            
            # Get all table names (excluding views)
            cursor.execute("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")
            tables = [table[0] for table in cursor.fetchall()]
            
            # Get all view names
            cursor.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'")
            views = [view[0] for view in cursor.fetchall()]
            
            sql_backup.append("-- Database backup generated by CDD Legrigne")
            sql_backup.append(f"-- Database: {self.database}")
            sql_backup.append("-- Generated on: " + str(datetime.datetime.now()))
            sql_backup.append("")
            sql_backup.append("SET FOREIGN_KEY_CHECKS = 0;")
            sql_backup.append("")
            
            # Process tables
            for table in tables:
                # Get table structure
                cursor.execute(f"SHOW CREATE TABLE `{table}`")
                create_table = cursor.fetchone()[1]
                sql_backup.append(f"-- Structure for table `{table}`")
                sql_backup.append(f"DROP TABLE IF EXISTS `{table}`;")
                sql_backup.append(create_table + ";")
                sql_backup.append("")
                
                # Get table data
                cursor.execute(f"SELECT * FROM `{table}`")
                rows = cursor.fetchall()
                
                if rows:
                    # Get column information
                    cursor.execute(f"DESCRIBE `{table}`")
                    columns = [col[0] for col in cursor.fetchall()]
                    
                    sql_backup.append(f"-- Data for table `{table}`")
                    
                    for row in rows:
                        values = []
                        for value in row:
                            if value is None:
                                values.append("NULL")
                            elif isinstance(value, str):
                                # Escape single quotes in strings
                                escaped_value = value.replace("'", "''")
                                values.append(f"'{escaped_value}'")
                            elif isinstance(value, bytes):
                                # Handle binary data
                                values.append(f"0x{value.hex()}")
                            else:
                                values.append(str(value))
                        
                        column_list = ", ".join([f"`{col}`" for col in columns])
                        value_list = ", ".join(values)
                        sql_backup.append(f"INSERT INTO `{table}` ({column_list}) VALUES ({value_list});")
                    
                    sql_backup.append("")
            
            # Process views (structure only, no data)
            for view in views:
                try:
                    cursor.execute(f"SHOW CREATE VIEW `{view}`")
                    create_view = cursor.fetchone()[1]
                    sql_backup.append(f"-- View structure for `{view}`")
                    sql_backup.append(f"DROP VIEW IF EXISTS `{view}`;")
                    sql_backup.append(create_view + ";")
                    sql_backup.append("")
                except Exception as e:
                    sql_backup.append(f"-- Error creating view {view}: {str(e)}")
                    sql_backup.append("")
            
            sql_backup.append("SET FOREIGN_KEY_CHECKS = 1;")
            return "\n".join(sql_backup)
            
        except Exception as e:
            raise Exception(f"Python backup failed: {str(e)}")
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

# Global database instance
db_config = DatabaseConfig()
