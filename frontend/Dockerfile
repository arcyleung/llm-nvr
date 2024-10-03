FROM node:20

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install --save-dev \
&& npm run build-only
ENTRYPOINT ["npm"]
CMD ["run", "dev"]
