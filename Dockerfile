FROM node:18-slim

# Установка HUGO
ENV HUGO_VERSION 0.125.4

RUN apt-get update && \
    apt-get install -y wget git && \
    wget https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz && \
    tar -zxvf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz && \
    mv hugo /usr/local/bin/ && \
    rm -rf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz

# Установка зависимостей проекта
WORKDIR /app
COPY . .
RUN npm install

# Запуск Hugo-сервера
EXPOSE 1313
CMD ["npm", "run", "start"]