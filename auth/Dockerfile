FROM node:alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --only=prod
COPY . .

CMD ["yarn", "start"]