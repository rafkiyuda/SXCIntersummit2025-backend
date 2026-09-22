# backend/Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose backend port
EXPOSE 3000

# For dev: use nodemon if you want hot reload
CMD ["node", "server.js"]
