FROM node:18.15.0-alpine3.17

# Create app directory
WORKDIR /usr/src/app

ENV NODE_ENV production

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "node", "./bin/www" ]
