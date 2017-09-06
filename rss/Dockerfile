FROM mhart/alpine-node:8

WORKDIR /app
COPY . .

RUN npm install

EXPOSE 8081
CMD ["node", "emitter.js"]
