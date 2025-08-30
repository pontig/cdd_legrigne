"""
Data Access Object for Hydration
"""

from typing import List
from flask import session
from config.database import db_config

class HydrationDAO:
    """Data Access Object for Hydration"""
    
    def get_hydration_entries(self, person_id: int) -> List[dict]:
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT idratazione.*, account.nome, account.cognome FROM idratazione
            JOIN account ON idratazione.firma = account.id
            WHERE id_persona = %s AND id_semestre {semester_constraint}
            ORDER BY anno DESC, mese_int DESC, giorno DESC
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            if session.get('semester') is not None:
                cursor.execute(query, (person_id, session.get('semester')))
            else:
                cursor.execute(query, (person_id,))
            results = cursor.fetchall()

            toilet_entries = []
            for row in results:
                toilet_entries.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'done': row[5],
                    'notes': row[6],
                    'signature': f"{row[9]} {row[10]}"
                })
            return toilet_entries

        except Exception as e:
            if connection:
                connection.rollback()

            return str(e)

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
        
    def create_hydration_entry(self, data: dict) -> None:
        """Create a new hydration entry"""
        query = """
            INSERT INTO idratazione VALUES
            (NULL, %s, %s, %s, %s, %s, %s, %s, NULL)
        """
        connection = None
        cursor = None

        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            date = data['date'].split('-')
            done = 1 if 'done' in data and data['done'] == "on" else 0
            
            cursor.execute(query, (
                data['person_id'],
                int(date[2]),  # day
                int(date[1]),  # month
                int(date[0]),  # year
                done,
                data.get('notes', 'NULL'),
                session.get('user_id')
            ))
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
                
    def delete_hydration_entry(self, entry_id: int) -> None:
        """Delete a hydration entry"""
        query = "DELETE FROM idratazione WHERE id = %s"
        connection = None
        cursor = None

        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (entry_id,))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

hydration_dao = HydrationDAO()