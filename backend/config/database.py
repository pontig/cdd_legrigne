"""
Database configuration module
"""
import MySQLdb
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

# Global database instance
db_config = DatabaseConfig()
