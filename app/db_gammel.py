"""
import os
import sqlite3
import sqlalchemy as sa



engine = sa.create_engine("sqlite:///instance/database.db")
connection = engine.connect()

DB_PATH = "instance/database.db"

try:
    conn = sqlite3.connect(DB_PATH)
    print("Klarte å åpne databasen")
    conn.close()
except Exception as e:
    print("Feil ved åpning av database", e)


def get_connection():
    #Open new connection every time
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn




    conn = get_connection() # Open database
    cur = conn.cursor()     # Create tool to run SQL

    cur.execute(sql)        # Run SQL
    conn.commit()           # Save changes
    conn.close()            # Close database

def save_measurement(pi_id, sensor: str, ts: float, value: float):
    sql = "INSERT INTO measurement (pi_id, sensor, ts, value) VALUES (?, ?, ?, ?);"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(sql, (pi_id, sensor, ts, value))
    conn.commit()
    conn.close()

#TEST printer database

def get_measurements(limit: int = 20):
    sql = "SELECT * FROM measurement ORDER BY ts DESC LIMIT ?;"
    
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(sql, (limit,))
    rows = cur.fetchall()

    conn.close()
    return rows
    """