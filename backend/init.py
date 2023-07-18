from src.database.database import get_db, Base, engine, SessionLocal
from src.models import models


def init_db():
    db = SessionLocal
    models.Base.metadata.create_all(engine)
    # if not inspect(engine).has_table('tag'):
    print("Tables are not created yet. Creating tables")
    # Prefill TAG table
    objects = [
        models.Tag(value='BPMN'),
        models.Tag(value='SIM_MODEL'),
        models.Tag(value='CONS_MODEL'),
        models.Tag(value='EVENT_LOG'),
        models.Tag(value='RESULTS')
    ]
    print(objects)
    db.bulk_save_objects(objects)
    db.commit()

    print("Initialized the db")


if __name__ == "__main__":
    init_db()
