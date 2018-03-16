FROM node:8.9.4-alpine
LABEL "author"="<zsea@qq.com>"
ENV  TIME_ZONE Asiz/Shanghai
RUN echo 'http://mirrors.aliyun.com/alpine/latest-stable/main' > /etc/apk/repositories
RUN echo 'http://mirrors.aliyun.com/alpine/latest-stable/community' >> /etc/apk/repositories
RUN apk update
RUN apk add --no-cache tzdata
RUN cp -r -f /usr/share/zoneinfo/Hongkong /etc/localtime
RUN npm install -g yarn --registry=https://registry.npm.taobao.org
RUN yarn config set registry https://registry.npm.taobao.org --global
RUN yarn config set disturl https://npm.taobao.org/dist --global
COPY . /app/
WORKDIR /app/
RUN yarn
EXPOSE 3000
ENTRYPOINT []
CMD node app.js