from pathlib import Path
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from gecko.config import settings, WORKSPACE_ROOT
from gecko.routes import generate as generate_router
from gecko.routes import profile as profile_router
from gecko.routes import settings as settings_router
from gecko.routes import simulators as simulators_router

app = FastAPI(
    title="GECKO API",
    description="Backend API for GECKO AI Simulator Generator",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulators_router.router)
app.include_router(settings_router.router)
app.include_router(profile_router.router)
app.include_router(generate_router.router)



@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "0.1.0"}


@app.get("/static/gecko-ui.js")
def get_gecko_ui_js():
    """Serve gecko-ui.js library static file."""
    js_file = WORKSPACE_ROOT / "knowledge" / "schema" / "gecko-ui.js"
    if not js_file.exists():
        raise HTTPException(status_code=404, detail="gecko-ui.js file not found")
    content = js_file.read_text(encoding="utf-8")
    return Response(content=content, media_type="application/javascript")


def run():
    """Run uvicorn server CLI entrypoint."""
    import uvicorn
    uvicorn.run(
        "gecko.main:app",
        host=settings.gecko_host,
        port=settings.gecko_port,
        reload=True,
    )


if __name__ == "__main__":
    run()
