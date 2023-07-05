from app.models.models import Tag
from database import get_db, Base, engine, SessionLocal
from app.models import models


def init_db():
    db = SessionLocal
    models.Base.metadata.create_all(engine)
    # if not inspect(engine).has_table('tag'):
    print("Tables are not created yet. Creating tables")
    # Prefill TAG table
    objects = [
        Tag(value='BPMN'),
        Tag(value='SIM_MODEL'),
        Tag(value='CONS_MODEL'),
        Tag(value='EVENT_LOG'),
        Tag(value='UNTAGGED')
    ]
    print(objects)
    db.bulk_save_objects(objects)
    db.commit()

    print("Initialized the db")


if __name__ == "__main__":
    init_db()
