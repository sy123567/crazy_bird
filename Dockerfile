FROM tomcat:11.0-jdk17

LABEL maintainer="crazy_bird"

COPY target/crazy_bird.war /usr/local/tomcat/webapps/

EXPOSE 8080

ENV CATALINA_HOME=/usr/local/tomcat
ENV PATH=$CATALINA_HOME/bin:$PATH

CMD ["catalina.sh", "run"]