from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, func
import uuid
from config import DATABASE_URL

engine = create_async_engine(DATABASE_URL)
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    plan: Mapped[str] = mapped_column(String, default="free")
    is_admin: Mapped[bool] = mapped_column(default=False)
    openai_api_key: Mapped[str | None] = mapped_column(String, nullable=True)
    openai_model: Mapped[str] = mapped_column(String, default="gpt-5.4-mini")
    gemini_api_key: Mapped[str | None] = mapped_column(String, nullable=True)
    gemini_model: Mapped[str] = mapped_column(String, default="gemini-2.5-flash")
    claude_api_key: Mapped[str | None] = mapped_column(String, nullable=True)
    claude_model: Mapped[str] = mapped_column(String, default="claude-sonnet-4-6")
    preferred_provider: Mapped[str] = mapped_column(String, default="openai")
    stripe_customer_id: Mapped[str | None] = mapped_column(String, nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())


class Generation(Base):
    __tablename__ = "generations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    result: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Auto-migrate: add missing columns to existing tables
        await conn.run_sync(_add_missing_columns)


def _add_missing_columns(conn):
    """Add columns that exist in the model but not in the database."""
    from sqlalchemy import inspect, text
    inspector = inspect(conn)
    for table_name, table in Base.metadata.tables.items():
        if not inspector.has_table(table_name):
            continue
        existing_cols = {c['name'] for c in inspector.get_columns(table_name)}
        for col in table.columns:
            if col.name not in existing_cols:
                col_type = conn.dialect.type_compiler.process(col.type)
                nullable = "NULL" if col.nullable else "NOT NULL"
                default = ""
                if col.default is not None:
                    default_val = col.default.arg
                    if callable(default_val):
                        default_val = default_val()
                    default = f" DEFAULT '{default_val}'"
                elif col.nullable:
                    default = " DEFAULT NULL"
                try:
                    conn.execute(text(
                        f'ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type} {nullable}{default}'
                    ))
                except Exception:
                    pass  # Column may already exist or type mismatch


async def get_db():
    async with async_session() as session:
        yield session
