FROM mariadb

WORKDIR /app

RUN npm install

# Bundle app source
COPY . .

RUN npm install

CMD [ "npm", "start" ]
