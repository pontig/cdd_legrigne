"""
Data Access Object for Toilet
"""

from typing import List
from flask import session
from config.database import db_config

class ToiletDAO:
    """Data Access Object for Toilet"""
    
    def get_toilet_entries(self, person_id: int) -> List[dict]:
        """Get toilet entries for a specific person"""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT bagno.*, account.nome, account.cognome FROM bagno
            JOIN account ON bagno.firma = account.id
            WHERE id_persona = %s AND id_semestre {semester_constraint}
            ORDER BY anno DESC, mese_int DESC, giorno DESC, mattino ASC
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
                    'morning': row[5],
                    'urine': row[6],
                    'feces': row[7],
                    'diaper': row[8],
                    'redness': row[9],
                    'period': row[10],
                    'belt': row[11],
                    'signature': f"{row[14]} {row[15]}"
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
                
    def create_toilet_entry(self, data: dict) -> None:
        """Create a new toilet entry"""
        query = """
            INSERT INTO bagno VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,  NULL)    
        """
        
        connection = None
        cursor = None
        
        try:
            date = data['date'].split('-') # YYYY-MM-DD format
            morning = 1 if data['morning'] == 'yes' else 0
            urine = 1 if data['urine'] == 'yes' else 0
            feces = 1 if data['feces'] == 'yes' else 0
            diaper = data['diaper'] if data['diaper'] != '2' else None
            redbess = 1 if 'redness' in data and data['redness'] == "on" else 0
            period = 1 if 'period' in data and data['period'] == "on" else 0
            belt = 1 if 'belt' in data and data['belt'] == "on" else 0
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (
                data['person_id'],
                date[2],
                date[1],
                date[0],
                morning,
                urine,
                feces,
                diaper,
                redbess, period, belt,
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

    def delete_toilet_entry(self, entry_id: int) -> None:
        """Delete a toilet entry"""
        query = """
            DELETE FROM bagno WHERE id = %s
        """

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

toilet_dao = ToiletDAO()