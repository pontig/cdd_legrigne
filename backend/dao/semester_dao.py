"""
Data Access Object for semester management
"""

from typing import List

from flask import session
from config.database import db_config

class SemesterDAO:
    """Data Access Object for semester management"""
    
    def get_semesters(self) -> List[dict]:
        """Get all semesters"""
        query = """
            SELECT id, iniziale, finale FROM semestre
        """
        connection = None
        cursor = None

        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()

            semesters = []
            for row in results:
                semesters.append({
                    'id': row[0],
                    'start': row[1],
                    'end': row[2],
                })
            return semesters

        except Exception as e:
            if connection:
                connection.rollback()
            raise e

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
semester_dao = SemesterDAO()