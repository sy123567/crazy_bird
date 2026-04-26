FROM tomcat:11.0-jdk17

COPY webapp/ /usr/local/tomcat/webapps/crazy_bird/

EXPOSE 8080

CMD ["catalina.sh", "run"]