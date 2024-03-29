FROM node:18-alpine

COPY . .

RUN npm install && npm run build:prod && npm prune --production

EXPOSE 3000

CMD npm run start