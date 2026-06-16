from fastapi import FastAPI

from routes.chat import router as chat_router
from routes.memory import router as memory_router

from database.db import engine
from database.models import Base

Base.metadata.create_all(bind=engine)


app = FastAPI()

app.include_router(chat_router)
app.include_router(memory_router)
@app.get("/")
def root():
    return {"status": "running"}
