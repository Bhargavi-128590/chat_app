# 1. Base image
FROM node:20

# 2. Create app directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all code
COPY . .

# 6. Expose port
EXPOSE 3000

# 7. Start app
CMD ["npm", "start"]