FROM node:12-alpine

COPY . .

RUN npm install
RUN npm run build:prod

EXPOSE 3000

CMD npm run start