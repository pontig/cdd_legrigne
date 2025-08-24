"""
Data Access Object for activities
"""

from typing import List

from flask import session
from config.database import db_config

class ActivitiesDAO:
    """Data Access Object for activities"""

    def get_activities(self, person_id: int, month: int | None) -> List[dict]:
        """Get activities for a specific person"""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        month_constraint = " AND pa.mese_int = %s" if month is not None else ""
        query = f"""
            SELECT 
                pa.id,
                pa.id_persona,
                pa.giorno,
                pa.mese_int,
                pa.anno,
                pa.mattino,
                a.nome_attivita,
                pa.adesione,
                pa.partecipazione,
                pa.umore,
                pa.comunicazione,
                pa.comportamento_problematico,
                a.id as attivita_id

            FROM partecipazione_attivita pa
            LEFT JOIN attivita a ON pa.attivita = a.id
            WHERE id_persona = %s AND pa.id_semestre {semester_constraint}{month_constraint}
            ORDER BY anno DESC, mese_int DESC, giorno DESC
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            params = [person_id]
            if session.get('semester') is not None:
                params.append(session.get('semester'))
            if month is not None:
                params.append(month)
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            activities = []
            for row in results:
                activities.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'morning': row[5],
                    'activity': row[6],
                    'adesion': row[7],
                    'participation': row[8],
                    'mood': row[9],
                    'communication': row[10],
                    'problem_behaviour': row[11],
                    'activity_id': row[12]
                })
            return activities
        
        except Exception as e:
            if connection:
                connection.rollback()
            raise e  # Raise the exception for the caller to handle

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def get_appreciations(self, month: int = None) -> List[dict]:
        """Get appreciations for all persons"""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        month_constraint = " AND g.mese = %s" if month is not None else ""
        
        if month is not None:
            # Return data for specific month
            query = f"""
                SELECT 
                    p.nome,
                    p.cognome,
                    g.id_persona,
                    g.attivita,
                    g.mese,
                    g.id_semestre,
                    g.mediaAdesione,
                    g.mediaPartecipazione,
                    g.nVolte,
                    a.id,
                    a.nome_attivita,
                    a.abbreviazione
                FROM grad g 
                JOIN attivita a ON g.attivita = a.id
                JOIN persona p ON g.id_persona = p.id
                WHERE id_semestre {semester_constraint}{month_constraint}
                ORDER BY g.id_persona, a.abbreviazione, g.mese
            """
        else:
            # Aggregate by month and calculate final averages
            query = f"""
                SELECT 
                    p.nome,
                    p.cognome,
                    g.id_persona,
                    g.attivita,
                    AVG(g.mediaAdesione) as avg_adesione,
                    AVG(g.mediaPartecipazione) as avg_partecipazione,
                    SUM(g.nVolte) as total_volte,
                    a.id,
                    a.nome_attivita,
                    a.abbreviazione
                FROM grad g 
                JOIN attivita a ON g.attivita = a.id
                JOIN persona p ON g.id_persona = p.id
                WHERE id_semestre {semester_constraint}
                GROUP BY g.id_persona, g.attivita, a.id, a.nome_attivita, a.abbreviazione, p.nome, p.cognome
                ORDER BY g.id_persona, a.abbreviazione
            """
        
        connection = None
        cursor = None

        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            
            params = []
            if session.get('semester') is not None:
                params.append(session.get('semester'))
            if month is not None:
                params.append(month)
                
            cursor.execute(query, params)
            results = cursor.fetchall()

            appreciations = []
            # Group results by id_persona
            grouped_data = {}
            person_names = {}
            for row in results:
                person_id = row[2]
                
                # Store person's name and surname
                if person_id not in person_names:
                    person_names[person_id] = {
                        'nome': row[0],
                        'cognome': row[1]
                    }
                
                if person_id not in grouped_data:
                    grouped_data[person_id] = []
                
                if month is not None:
                    grouped_data[person_id].append({
                        'id_persona': row[2],
                        'attivita': row[3],
                        'mese': row[4],
                        'id_semestre': row[5],
                        'media_adesione': int(row[6]),
                        'media_partecipazione': int(row[7]),
                        'n_volte': int(row[8]),
                        'abbreviazione': row[9],
                    })
                else:
                    grouped_data[person_id].append({
                        'id_persona': row[2],
                        'attivita': row[3],
                        'media_adesione': int(round(row[4], 0)),
                        'media_partecipazione': int(round(row[5], 0)),
                        'n_volte': int(row[6]),
                        'abbreviazione': row[9],
                    })
            
            # Convert grouped data to list format
            for person_id, person_data in grouped_data.items():
                appreciations.append({
                    'id_persona': person_id,
                    'nome': person_names[person_id]['nome'],
                    'cognome': person_names[person_id]['cognome'],
                    'activities': person_data
                })
                
            activities = self.get_activities_list()
            return {
                'appreciations': appreciations,
                'activities': activities
            }

        except Exception as e:
            if connection:
                connection.rollback()
            raise e

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_activities_list(self) -> List[dict]:
        """Get the available activities"""
        query = """
            SELECT id, nome_attivita, abbreviazione FROM attivita
            ORDER BY abbreviazione
        """
        connection = None
        cursor = None

        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()

            activities = []
            for row in results:
                activities.append({
                    'id': row[0],
                    'nome_attivita': row[1],
                    'abbreviazione': row[2]
                })
            activities.append(activities[0]) 
            activities.pop(0)
            return activities

        except Exception as e:
            if connection:
                connection.rollback()
            raise e

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def create_activity_entry(self, data: dict) -> None:
        """Create a new activity entry"""
        query = """
            INSERT INTO partecipazione_attivita VALUES
            (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NULL)
        """
        
        connection = None
        cursor = None
        
        try:
            date = data['date'].split('-')  # YYYY-MM-DD format
            morning = 1 if data['morning'] == 'yes' else 0
            problem_behaviour = 1 if data.get('problem_behaviour') else 0
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (
                data['person_id'],
                date[2],
                date[1],
                date[0],
                morning,
                data['activity'],
                data['adesion'],
                data['participation'],
                data['mood'],
                data['communication'],
                problem_behaviour
            ))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error creating logbook entry: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def delete_activity(self, activity_id: int) -> None:
        """Delete an activity entry"""
        query = "DELETE FROM partecipazione_attivita WHERE id = %s"
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (activity_id,))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error deleting activity: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def declare_absence(self, data: dict) -> None:
        """Declare absence for a person"""
        query = """
            INSERT INTO partecipazione_attivita (id_persona, giorno, mese_int, anno, mattino, attivita, id_semestre)
            VALUES (%s, %s, %s, %s, %s, NULL, NULL);
        """
        
        connection = None
        cursor = None
        
        try:
            date = data['date'].split('-')  # YYYY-MM-DD format
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (
                data['person_id'],
                date[2],
                date[1],
                date[0],
                0
            ))
            cursor.execute(query, (
                data['person_id'],
                date[2],
                date[1],
                date[0],
                1
            ))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error declaring absence: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()


activities_dao = ActivitiesDAO()