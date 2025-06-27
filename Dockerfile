FROM quay.io/skopeo/stable:latest

RUN dnf -y update && dnf -y install nodejs git && \
    dnf clean all && rm -rf /var/cache /var/log/dnf* /var/log/yum.*

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

ENTRYPOINT []