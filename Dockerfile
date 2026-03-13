FROM node:20-slim AS frontend-builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

# Copy Python deps and install
COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir -r /app/server/requirements.txt

# Copy server code
COPY server/ /app/server/

# Copy frontend build (for static serving if needed)
COPY --from=frontend-builder /app/.next /app/.next
COPY --from=frontend-builder /app/public /app/public
COPY --from=frontend-builder /app/node_modules /app/node_modules
COPY --from=frontend-builder /app/package.json /app/package.json

WORKDIR /app/server

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
