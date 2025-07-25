"""
Data Access Object for Home operations
"""

from typing import List, Optional
from config.database import db_config

class HomeDAO:
    """Data Access Object for Home operations"""
    
    def get_home_data(self) -> List[dict]:
        """Get data for the home page"""
        # Single query that JOINs guests with their activities
        query = """SELECT * FROM persona WHERE visibile = 1 ORDER BY cognome, nome"""
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            
            # Group results by guest
            home_data = {}
            for row in results:
                # Assuming persona table has columns: id, nome, cognomeil, visibile
                guest_data = row[:5]  # First 5 columns are from persona table
                guest_id = guest_data[0]
                
                if guest_id not in home_data:
                    home_data[guest_id] = {
                        'id': guest_data[0],
                        'name': guest_data[1],
                        'surname': guest_data[2], 
                        'visible': guest_data[4],
                        'activities': []
                    }
                    
                    # Get activities from last week (Monday to Friday only)
                    activities_query = """
                        WITH RECURSIVE date_range AS (
                            SELECT CURDATE() - INTERVAL 6 DAY as date_val
                            UNION ALL
                            SELECT date_val + INTERVAL 1 DAY
                            FROM date_range
                            WHERE date_val < CURDATE()
                        ),
                        weekdays AS (
                            SELECT date_val,
                                   DAY(date_val) as giorno,
                                   MONTH(date_val) as mese_int,
                                   YEAR(date_val) as anno
                            FROM date_range
                            WHERE DAYOFWEEK(date_val) BETWEEN 2 AND 6
                        )
                        SELECT w.giorno, w.mese_int, w.anno, COALESCE(COUNT(p.id_persona), 0) as activity_count
                        FROM weekdays w
                        LEFT JOIN partecipazione_attivita p ON w.giorno = p.giorno 
                            AND w.mese_int = p.mese_int 
                            AND w.anno = p.anno 
                            AND p.id_persona = %s
                        GROUP BY w.giorno, w.mese_int, w.anno
                        HAVING activity_count < 2
                        ORDER BY w.anno DESC, w.mese_int DESC, w.giorno DESC
                    """
                    cursor.execute(activities_query, (guest_id,))
                    activities = cursor.fetchall()
                    
                    # Add activities to guest data
                    for activity_row in activities:
                        home_data[guest_id]['activities'].append({
                            'day': activity_row[0],
                            'month_int': activity_row[1],
                            # 'year': activity_row[2],
                            # 'activity_count': activity_row[3]
                        })

            return list(home_data.values())
            
        except Exception as e:
            if connection:
                connection.rollback()
            # return str(e)

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
home_dao = HomeDAO()