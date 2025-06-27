FROM quay.io/skopeo/stable:latest

RUN dnf -y update && dnf -y install nodejs git && \
    dnf clean all && rm -rf /var/cache /var/log/dnf* /var/log/yum.*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

ENTRYPOINT []
CMD ["npm", "run", "test"]
