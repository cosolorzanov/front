FROM node:12.12.0-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build --prod

EXPOSE 80

CMD ["npm", "run", "start"]
