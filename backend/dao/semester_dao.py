"""
Data Access Object for semester management
"""

from typing import List

from flask import session
from config.database import db_config
from info import mesi_ita

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
                
    def create_new_semester(self) -> None:
        """Create a new semester"""
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            
            # Optimized: Get first and last activity dates in separate but efficient queries
            cursor.execute("""
                SELECT giorno, mese_int, anno FROM partecipazione_attivita
                ORDER BY anno ASC, mese_int ASC, giorno ASC
                LIMIT 1
            """)
            first_date = cursor.fetchone()
            
            cursor.execute("""
                SELECT giorno, mese_int, anno FROM partecipazione_attivita
                ORDER BY anno DESC, mese_int DESC, giorno DESC
                LIMIT 1
            """)
            last_date = cursor.fetchone()
            
            if not first_date or not last_date:
                raise ValueError("No activities found to determine semester dates.")
            
            # Format dates
            start_date = f"{first_date[0]} {mesi_ita[first_date[1] - 1]} {first_date[2]}"
            end_date = f"{last_date[0]} {mesi_ita[last_date[1] - 1]} {last_date[2]}"

            # Create new semester
            cursor.execute("INSERT INTO semestre (iniziale, finale) VALUES (%s, %s)", 
                          (start_date, end_date))
            semester_id = cursor.lastrowid
            
            # Get all tables with id_semestre column (excluding views)
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.columns 
                WHERE column_name = 'id_semestre' 
                AND table_schema = DATABASE()
                AND table_name != 'semestre' AND table_name != 'grad'
            """)
            
            tables_with_semester = cursor.fetchall()
            
            # Update all related tables in batch
            for table in tables_with_semester:
                table_name = table[0]
                cursor.execute(f"UPDATE `{table_name}` SET id_semestre = %s WHERE id_semestre IS NULL", 
                              (semester_id,))
            
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

semester_dao = SemesterDAO()