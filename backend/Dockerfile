FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Railway uses dynamic PORT
ENV PORT=8001
EXPOSE $PORT

# Run the application (Railway sets PORT automatically)
CMD python -m uvicorn server:app --host 0.0.0.0 --port $PORT
