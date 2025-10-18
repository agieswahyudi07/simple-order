FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start dev server inside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
