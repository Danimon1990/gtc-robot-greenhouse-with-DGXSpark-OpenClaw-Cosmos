from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import sensors, actuators, agent, history

app = FastAPI(title="Greenhouse Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensors.router, prefix="/api")
app.include_router(actuators.router, prefix="/api")
app.include_router(agent.router, prefix="/api")
app.include_router(history.router, prefix="/api")
