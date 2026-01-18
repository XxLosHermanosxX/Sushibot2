FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Railway uses dynamic PORT
ENV PORT=3001
EXPOSE $PORT

# Run the application
CMD node bot.js
