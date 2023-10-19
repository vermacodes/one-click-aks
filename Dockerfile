FROM actlab.azurecr.io/repro_base:latest

WORKDIR /app

ADD entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

ADD /app/server/server ./
ADD /tf ./tf
ADD /scripts ./scripts

EXPOSE 8080/tcp
EXPOSE 443/tcp

ENTRYPOINT [ "/bin/bash", "/app/entrypoint.sh" ]