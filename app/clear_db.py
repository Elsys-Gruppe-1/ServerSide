from app.db import Session
from app.models import Measurements

with Session() as session:
    session.query(Measurements).delete()
    session.commit()

print("Database tømt")