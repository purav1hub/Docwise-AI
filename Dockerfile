# Stage 1: Build the React app
FROM node:20-alpine AS build

# This variable will be passed from Google Cloud Build
ARG GEMINI_API_KEY
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Write the API key to .env.local before building
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Build the app (Vite puts files in 'dist' folder)
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files from the first stage to Nginx folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port Cloud Run expects
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
