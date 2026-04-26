import os
from sqlalchemy import create_engine, JSON, Column, Integer, String, Float, BINARY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

IMAGE_DIR = os.path.join("instance", "save_prediction_images")
os.makedirs(IMAGE_DIR, exist_ok=True)

engine = create_engine("sqlite:///instance/database.db")
Base = declarative_base()

class Measurements(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key = True, autoincrement = True)
    pi_id = Column(Integer, nullable=False)
    sensor_name = Column(String, nullable = False)

    ts = Column(String, nullable = False)
    sensor_value = Column(Float, nullable = False)
    depth = Column(Float, nullable = True)

    #values = Column(JSON, nullable = False)

class Detections(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key = True, autoincrement = True)
    pi_id = Column(Integer, nullable=False)
    fish_id = Column(Integer, nullable=False)
    data = Column(JSON, nullable = False)
    image_path = Column(String, nullable=False)
    ts = Column(String, nullable = False)
    


"""
TYPISK ENTERY I DATABSEN

id: x
pi_id: 1
sensor_name: TDS

ts: 23.91.21.23:23:23
sensor_value: 0.13
depth: 100


en annen entry:

TYPISK ENTERY I DATABSEN

id: x
pi_id: 1
sensor_name: Temrmistor

ts: 23.91.21.23:23:23
sensor_value: 0.13
depth: 100
"""

Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
