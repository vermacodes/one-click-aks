FROM repro_base

WORKDIR /app

ADD entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

ADD /app/ui/package.json ./
ADD /app/ui/build ./
ADD /app/server/server ./
ADD /tf ./tf
ADD /scripts ./scripts

EXPOSE 3000/tcp
EXPOSE 8080/tcp

ENTRYPOINT [ "/bin/bash", "/app/entrypoint.sh" ]