from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Memory(Base):

    __tablename__ = "memories"

    id = Column(Integer, primary_key=True)

    memory_text = Column(String)

    category = Column(String)
