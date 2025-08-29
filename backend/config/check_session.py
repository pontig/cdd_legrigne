from flask import session

def check_session():
    # TODO: return error 401 if session is invalid instead of boolean
    # And then add the decorator @check_session
    """Check if the user session is valid"""
    if 'user_id' not in session:
        # Dump session for debugging purposes
        return False
    # Additional session validation logic can be added here
    return True