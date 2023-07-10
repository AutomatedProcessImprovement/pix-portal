# from config import Base, db_session, engine
# from src.models.models import Tag
#
#
# def init_db():
#     # if not inspect(engine).has_table('tag'):
#     print("Tables are not created yet. Creating tables")
#     Base.metadata.create_all(bind=engine)
#         # Prefill TAG table
#     objects = [
#         Tag(value='BPMN'),
#         Tag(value='SIM_MODEL'),
#         Tag(value='CONS_MODEL'),
#         Tag(value='EVENT_LOG'),
#         Tag(value='UNTAGGED')
#     ]
#     print(objects)
#     db_session.bulk_save_objects(objects)
#
#     db_session.commit()
#
#     print("Initialized the db")
#
#
# if __name__ == "__main__":
#     init_db()
