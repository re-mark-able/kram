FROM node:26-alpine3.23
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm","run","start"]