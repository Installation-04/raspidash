FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
VOLUME ["/data"]
ENV DATA_PATH=/data/config.json
EXPOSE 7532
CMD ["npm", "start"]
