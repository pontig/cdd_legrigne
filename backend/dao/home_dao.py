"""
Data Access Object for Home operations
"""

from typing import List, Optional
from config.database import db_config

class HomeDAO:
    """Data Access Object for Home operations"""
    
    def get_home_data(self) -> List[dict]:
        """Get data for the home page - optimized single query version"""
        query = f"""
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
            ),
            guest_activities AS (
                SELECT 
                    p.id,
                    p.nome,
                    p.cognome,
                    p.visibile,
                    w.giorno,
                    w.mese_int,
                    w.anno,
                    COALESCE(COUNT(pa.id_persona), 0) as activity_count
                FROM persona p
                CROSS JOIN weekdays w
                LEFT JOIN partecipazione_attivita pa ON pa.id_persona = p.id
                    AND pa.giorno = w.giorno 
                    AND pa.mese_int = w.mese_int 
                    AND pa.anno = w.anno
                WHERE p.visibile = 1
                GROUP BY p.id, p.nome, p.cognome, p.visibile, w.giorno, w.mese_int, w.anno
                HAVING activity_count < 2
            )
            SELECT 
                id,
                nome,
                cognome,
                visibile,
                giorno,
                mese_int,
                anno
            FROM guest_activities
            ORDER BY cognome, nome, anno DESC, mese_int DESC, giorno DESC
        """
        
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
                guest_id = row[0]
                
                if guest_id not in home_data:
                    home_data[guest_id] = {
                        'id': row[0],
                        'name': row[1],
                        'surname': row[2], 
                        'visible': row[3],
                        'activities': []
                    }
                
                # Add activity day to guest data
                if row[4] is not None:  # Only add if there's an available day
                    home_data[guest_id]['activities'].append({
                        'day': row[4],
                        'month_int': row[5],
                        # 'year': row[6]
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
                
    def delete_guest(self, guest_id: int) -> bool:
        """Delete a guest by ID"""
        query = """
            UPDATE persona SET visibile = 0
            WHERE id = %s
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (guest_id,))
            connection.commit()
            return True
            
        except Exception as e:
            if connection:
                connection.rollback()
            raise e
            
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
home_dao = HomeDAO()