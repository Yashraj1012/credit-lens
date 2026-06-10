import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routes import predict, analytics

app = FastAPI(
    title=settings.app_name,
    description="Backend service for CreditLens credit risk assessment and prediction.",
    version="1.0.0",
    debug=settings.debug
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)

@app.get("/", tags=["health"])
async def root():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": "1.0.0",
        "endpoints": {
            "predict": f"{settings.api_prefix}/predict",
            "analytics": f"{settings.api_prefix}/analytics"
        }
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
