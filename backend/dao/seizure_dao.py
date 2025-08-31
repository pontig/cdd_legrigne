"""
Data Access Object for epileptic seizures
"""

from typing import List
from flask import session
from config.database import db_config

class SeizureDAO:
    """Data Access Object for epileptic seizures"""
    
    def get_seizures(self, person_id: int) -> List[dict]:
        """Get all seizures for a specific person."""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT crisi_epilettica.*, account.nome, account.cognome FROM crisi_epilettica
            JOIN account ON crisi_epilettica.firma = account.id
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
            
            seizures = []
            for row in results:
                t = str(row[5]) if row[5] is not None else None
                t = t[:-3] if t else None
                seizures.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'time': t,
                    'duration': row[6],
                    'notes': row[7],
                    'signature': f"{row[10]} {row[11]}",
                })
            return seizures

        except Exception as e:
            print("Error fetching seizures:", e)
            return []
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def create_seizure(self, data: dict) -> None:
        """Create a new seizure entry."""
        query = """
            INSERT INTO crisi_epilettica VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, NULL)
        """
        
        connection = None
        cursor = None
        
        try:
            date = data['date'].split('-') # YYYY-MM-DD format
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (
                data['person_id'],
                date[2],
                date[1],
                date[0],
                data['time'],
                data['duration'],
                data.get('notes', 'NULL'),
                session.get('user_id')
            ))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error creating seizure entry: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def delete_seizure(self, seizure_id: int) -> None:
        """Delete a seizure entry."""
        query = """
            DELETE FROM crisi_epilettica WHERE id = %s
        """

        connection = None
        cursor = None

        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (seizure_id,))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error deleting seizure entry: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

seizure_dao = SeizureDAO()