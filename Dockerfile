FROM node:alpine
RUN apk add --no-cache bash
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn run build
EXPOSE 3000
CMD ["npm", "start"]