# Pull base image.
FROM dockerfile/nodejs-bower-grunt

ONBUILD RUN apt-get update -y && apt-get -y install gcc make build-essential

RUN npm install -g node-gyp

# Set instructions on build.
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app

ADD bower.json /tmp/bower.json
ADD .bowerrc /tmp/.bowerrc
RUN mkdir -p /tmp/frontend/packages && cd /tmp && bower install --allow-root
RUN mkdir -p /app/frontend && cp -a /tmp/frontend/packages /app/frontend

ADD . /app

# Define working directory.
WORKDIR /app

# Expose ports.
EXPOSE 3000

# Define default command.
CMD ["npm", "start"]
