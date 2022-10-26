FROM ubuntu:22.04

RUN mkdir /app
WORKDIR /app

ADD run.sh ./
ADD package.json ./

RUN chmod +x ./run.sh
RUN ./run.sh