.PHONY: install dev frontend backend test test-be test-fe clean help

VENV ?= backend/.venv
PYTHON = $(VENV)/bin/python
PIP = $(VENV)/bin/pip
PYTEST = $(VENV)/bin/pytest
UVICORN = $(VENV)/bin/uvicorn

help:
	@echo "GECKO Management Commands:"
	@echo "  make install    - Install all dependencies (backend + frontend)"
	@echo "  make dev        - Start frontend + backend concurrently"
	@echo "  make backend    - Start FastAPI backend service at http://localhost:8000"
	@echo "  make frontend   - Start Vite frontend dev server"
	@echo "  make test       - Run backend and frontend test suites"
	@echo "  make test-be    - Run pytest for FastAPI backend"
	@echo "  make test-fe    - Run frontend unit tests"
	@echo "  make clean      - Clean build artifacts and virtual environment"

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip setuptools wheel
	$(PIP) install -e backend/[dev]

install: $(VENV)/bin/activate
	@if [ -f frontend/package.json ]; then \
		echo "Installing frontend dependencies..."; \
		(cd frontend && npm install); \
	fi

backend: install
	PYTHONPATH=backend/src $(UVICORN) gecko.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@if [ -f frontend/package.json ]; then \
		(cd frontend && npm run dev); \
	else \
		echo "Frontend not set up yet (Phase 3)."; \
	fi

dev: install
	@if [ -f frontend/package.json ]; then \
		make -j2 backend frontend; \
	else \
		make backend; \
	fi

test-be: install
	PYTHONPATH=backend/src $(PYTEST) backend/tests

test-fe:
	@if [ -f frontend/package.json ]; then \
		(cd frontend && npm test); \
	else \
		echo "Frontend tests not set up yet (Phase 3)."; \
	fi

test: test-be test-fe

clean:
	rm -rf $(VENV)
	rm -rf backend/src/*.egg-info
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
