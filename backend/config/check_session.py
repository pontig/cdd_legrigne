from flask import session

def check_session():
    """Check if the user session is valid"""
    if 'user_id' not in session:
        # Dump session for debugging purposes
        return False
    # Additional session validation logic can be added here
    return True