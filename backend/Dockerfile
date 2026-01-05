# Backend Dockerfile
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy Prisma schema so postinstall (prisma generate) can run during install
COPY prisma ./prisma

# Install production dependencies
RUN npm ci --omit=dev

# Copy remaining source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Create non-root user and set ownership
RUN groupadd -g 1001 nodejs || true && useradd -u 1001 -g nodejs -m nextjs || true
RUN chown -R nextjs:nodejs /app
USER nextjs

# Start the application
CMD ["npm", "start"]