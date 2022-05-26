FROM node:14.15.4
LABEL author="Tarun Mittal <gmail@ta.run>"
 
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN npm install -g forever

# Bundle app source
COPY . /usr/src/app


EXPOSE 8080
CMD [ "forever", "index.js" ]