FROM node:8.9.4-alpine
LABEL "author"="<zsea@qq.com>"
ENV  TIME_ZONE Asiz/Shanghai
RUN apk update
RUN apk add --no-cache tzdata
RUN cp -r -f /usr/share/zoneinfo/Hongkong /etc/localtime
RUN npm install -g yarn
COPY . /app/
WORKDIR /app/
RUN yarn
EXPOSE 3000
ENTRYPOINT []
CMD node app.js