FROM node:alpine

WORKDIR /app
COPY packege.json .
RUN yarn install --only=prod
COPY . .

CMD ["yarn", "start"]