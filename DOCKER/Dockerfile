FROM node:latest

WORKDIR /app

#COPY . .

RUN git clone https://github.com/venturas55/pfcdaw ./
RUN npm install

COPY .env .
COPY ./imagenes ./src/public/img/imagenes
COPY ./db ./db
COPY ./db /docker-entrypoint-initdb.d

EXPOSE 4000
CMD [ "npm", "start" ]
