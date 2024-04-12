FROM node:20.11.1-alpine3.19
WORKDIR /app
COPY . /app
RUN npm install
ENTRYPOINT exec npm run start:prod