# Stage 1: Builder stage
FROM python:3.11-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production stage
FROM python:3.11-alpine AS production

# Set working directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /root/.local /root/.local

# Add local packages to PATH
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . .

# Ensure uploads directory exists at build time and is writable by the app
RUN mkdir -p uploads && chmod 755 uploads

# If the source is in `backend/` but the application imports `app.*`,
# make a copy/move so the runtime package name `app` is present.
# This keeps the image working whether the repo folder is named `app/` or `backend/`.
RUN if [ -d backend ] && [ ! -d app ]; then mv backend app; fi
RUN mkdir -p app && touch app/__init__.py

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]