# One public origin for React UI, FastAPI and the catalogue API.
# Build stage: frontend code is compiled without any Gemini credentials.
FROM node:22-alpine AS frontend-builder
WORKDIR /build/frontend
COPY frontend/package.json ./package.json
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# Runtime stage: Python backend serves only the Vite build artifacts.
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN python -m pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ /app/backend/
COPY data/ /app/data/
COPY --from=frontend-builder /build/frontend/dist/ /app/frontend/dist/
RUN useradd --create-home --uid 10001 flarex && chown -R flarex:flarex /app
USER flarex
EXPOSE 8000
CMD ["sh", "-c", "exec python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
