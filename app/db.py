import os
import sqlite3

DB_PATH = "instance/database.db"

print("DB_PATH:", DB_PATH)
print("Finnes DB-fila?", os.path.exists(DB_PATH))

try:
    conn = sqlite3.connect(DB_PATH)
    print("Klarte å åpne databasen")
    conn.close()
except Exception as e:
    print("Feil ved åpning av database", e)
