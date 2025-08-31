"""
Data Access Object for vital parameters
"""

from typing import List
from flask import session
from config.database import db_config

class VitalDAO:
    """Data Access Object for vital parameters"""
    
    def get_vital_measurements(self, person_id: int) -> List[dict]:
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT * FROM pressione
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

            vital_measurements = []
            for row in results:
                vital_measurements.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'min_pressure': row[5],
                    'max_pressure': row[6],
                    'temperature': row[7],
                    'heart_rate': row[8],
                    'saturation': row[9]
                })
            return vital_measurements

        except Exception as e:
            if connection:
                connection.rollback()

            return str(e)

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def create_vital_entry(self, data: dict) -> None:
        """Create a new vital entry"""
        query = """
            INSERT INTO pressione VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, NULL)
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
                data['min_pressure'],
                data['max_pressure'],
                data['temperature'],
                data['heart_rate'],
                data['saturation']
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

    def delete_vital_entry(self, entry_id: int) -> None:
        """Delete a vital entry"""
        query = "DELETE FROM pressione WHERE id = %s"
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
                
vital_dao = VitalDAO()