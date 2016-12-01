FROM registry.ng.bluemix.net/ibmnode:v4

MAINTAINER Roberto Pozzi <roberto_pozzi@it.ibm.com>

# Update libs
RUN apt-get update \ 
	&& apt-get -y upgrade \ 
	&& apt-get -y autoclean \ 
	&& apt-get -y autoremove \ 
	&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create a directory and a related VOLUME to store nodejs application files
RUN rm -rf /ispPocUi
RUN mkdir /ispPocUi
#VOLUME /ispPocUi

# Set node application home dir as the working dir
WORKDIR /ispPocUi

# Add node application files
ADD . /ispPocUi

# Install dependencies
RUN npm install .

EXPOSE :8082

ENTRYPOINT  ["node", "app"]