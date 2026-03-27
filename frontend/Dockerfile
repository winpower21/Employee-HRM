ARG NODE_VERSION=25.8-alpine

FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json ./

COPY . .
RUN npm install

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
