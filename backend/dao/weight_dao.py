"""
Data Access Object for Weight
"""

from typing import List
from flask import session
from config.database import db_config

class WeightDAO:
    """Data Access Object for Weight"""
    
    def get_weight_measurements(self, person_id: int) -> List[dict]:
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT * FROM peso
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

            weight_measurements = []
            for row in results:
                weight_measurements.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'weight': row[5]
                })
            return weight_measurements

        except Exception as e:
            if connection:
                connection.rollback()

            return str(e)

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def create_weight_entry(self, data: dict) -> None:
        """Create a new weight entry"""
        query = """
            INSERT INTO peso VALUES (NULL, %s, %s, %s, %s, %s, NULL)
        """
        connection = None
        cursor = None

        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            date = data['date'].split('-')
            
            cursor.execute(query, (
                data['person_id'],
                int(date[2]),  # day
                int(date[1]),  # month
                int(date[0]),  # year
                data['value']
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

    def delete_weight_entry(self, entry_id: int) -> None:
        """Delete a weight entry"""
        query = "DELETE FROM peso WHERE id = %s"
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
                
weight_dao = WeightDAO()