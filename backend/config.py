import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "CreditLens Backend API"
    api_prefix: str = "/api"
    debug: bool = True
    allowed_origins: list[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",                      # Allow all origins for dev/sandbox purposes
    ]

# Initialize settings
settings = Settings()
