"""
Account Data Access Object for interacting with user account data.
"""

from typing import List, Optional

from flask import session
from config.database import db_config

class AccountDAO:
    """Data Access Object for user accounts"""
    
    def login(self, name: str, surname: str, password: str) -> Optional[int]:
        """Handle user login and return user ID if successful"""
        query = """
            SELECT id FROM account
            WHERE nome = %s AND cognome = %s AND password = %s
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (name, surname, password))
            result = cursor.fetchone()
            
            if result:
                return result[0]  # Return user ID
            return None  # No user found
        
        except Exception as e:
            if connection:
                connection.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                

account_dao = AccountDAO()