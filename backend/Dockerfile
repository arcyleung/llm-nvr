FROM node:20

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install --save-dev 

VOLUME /usr/src/app/node_modules

ENTRYPOINT ["node"]
CMD ["/usr/src/app/server.js"]
