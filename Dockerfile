FROM node:latest-alpine
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm","run","start"]