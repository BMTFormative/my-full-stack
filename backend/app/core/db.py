from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import AISettings, User, UserCreate, UserCredits

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)
    # Create default AI settings for superuser if not exists
    aisettings = session.exec(
        select(AISettings).where(AISettings.user_id == user.id)
    ).first()
    if not aisettings:
        aisettings = AISettings(user_id=user.id)
        session.add(aisettings)
    
    # Create default credits for superuser if not exists
    user_credits = session.exec(
        select(UserCredits).where(UserCredits.user_id == user.id)
    ).first()
    if not user_credits:
        user_credits = UserCredits(user_id=user.id, credits=1000)  # Give the superuser some initial credits
        session.add(user_credits)
    
    session.commit()