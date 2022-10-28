FROM ubuntu:22.04

RUN mkdir /app
WORKDIR /app

ADD run.sh ./
ADD package.json ./

RUN chmod +x ./run.sh
RUN ./run.sh
RUN /bin/bash -c 'apt-get install azure-cli=2.36.0-1~jammy -y'