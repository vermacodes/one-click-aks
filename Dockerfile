FROM repro_base

WORKDIR /app

ADD _run.sh ./

RUN chmod +x ./_run.sh

ADD /app/ui/package.json ./
ADD /app/ui/build ./
ADD /app/server/server ./
ADD /tf ./tf
ADD /apply.sh ./
ADD /destroy.sh ./

EXPOSE 3000/tcp
EXPOSE 8080/tcp

ENTRYPOINT [ "/bin/bash", "/app/_run.sh" ]