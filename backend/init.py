from sqlalchemy import inspect

from src.database.database import get_db, Base, engine, SessionLocal
from src.models import models


def init_db():
    db = get_db().__next__()

    no_create = inspect(engine).has_table('tag') and inspect(engine).has_table('file') and inspect(engine).has_table(
        'project') and inspect(engine).has_table('user')

    if no_create:
        print("Tables present")
    else:
        print("Not all tables are created yet. Creating tables")
        models.Base.metadata.create_all(engine)

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
