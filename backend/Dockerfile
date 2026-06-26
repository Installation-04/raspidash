FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
VOLUME ["/data"]
ENV DATA_PATH=/data/config.json
EXPOSE 7532
CMD ["npm", "run", "dev"]
