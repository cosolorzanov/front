FROM node:14.20.1-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 4200

CMD ["npm", "run", "start"]
