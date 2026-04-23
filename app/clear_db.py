from app.db import Session, Measurements

with Session() as session:
    session.query(Measurements).delete()
    session.commit()

print("Database tømt")