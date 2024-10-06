FROM node:20

WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install --save-dev
COPY . /usr/src/app
RUN npm install 

ENTRYPOINT ["node"]
CMD ["/usr/src/app/server.js"]
