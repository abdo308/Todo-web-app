from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routes import auth, todos, google_calendar
from prometheus_fastapi_instrumentator import Instrumentator

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Todo App API",
    description="A comprehensive Todo application backend built with FastAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)
Instrumentator().instrument(app).expose(app)
# Disable automatic trailing-slash redirects. Starlette by default issues
# redirects when a route is defined without/with a trailing slash and the
# request uses the other form; that can cause absolute redirects which are
# problematic behind a proxy. Disabling this means the app will return 404
# for mismatched trailing-slash paths instead of redirecting.
app.router.redirect_slashes = False

# Serve static files from /uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(google_calendar.router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Todo App API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)