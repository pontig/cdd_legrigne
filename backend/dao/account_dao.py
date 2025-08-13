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
            SELECT id, privilegi FROM account
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
                return result[0], result[1]  # Return user ID and privileges
            return None, None  # No user found
        
        except Exception as e:
            if connection:
                connection.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def change_password(self, account_id: int, old_password: str, new_password: str) -> bool:
        """Change user password if old password matches"""
        query = """
            UPDATE account
            SET password = %s
            WHERE id = %s AND password = %s
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (new_password, account_id, old_password))
            
            if cursor.rowcount > 0:
                connection.commit()
                return True  # Password changed successfully
            return False  # Old password did not match
        
        except Exception as e:
            if connection:
                connection.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def get_all_account_infos(self) -> List[dict]:
        """Get all account information for admin users"""
        query = """
            SELECT id, nome, cognome, privilegi FROM account
            ORDER BY privilegi DESC, cognome, nome
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            
            accounts = []
            for row in results:
                accounts.append({
                    'id': row[0],
                    'name': row[1],
                    'surname': row[2],
                    'permissions': row[3]
                })
            return accounts
            
        except Exception as e:
            if connection:
                connection.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def change_permissions(self, account_id: int, new_permissions: int) -> bool:
        """Change user permissions"""
        query = """
            UPDATE account
            SET privilegi = %s
            WHERE id = %s
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (new_permissions, account_id))
            
            if cursor.rowcount > 0:
                connection.commit()
                return True  # Permissions changed successfully
            return False  # No account found with the given ID
            
        except Exception as e:
            if connection:
                connection.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def create_operator(self, name: str, surname: str, sha_password: str, permissions: int = 0) -> bool:
        """Create a new operator account with default password"""
        query = """
            INSERT INTO account (nome, cognome, password, privilegi)
            VALUES (%s, %s, %s, %s)
        """
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (name, surname, sha_password, permissions))
            connection.commit()
            
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