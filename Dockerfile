FROM node:17.7.1-alpine3.15

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app
USER node

EXPOSE 3000

CMD ["npm","start"]
