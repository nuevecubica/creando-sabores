FROM progrium/buildstep
MAINTAINER Glue <hola@glue.gl>

RUN mkdir -p /root/.ssh; echo "\
-----BEGIN RSA PRIVATE KEY-----\n\
MIIEpQIBAAKCAQEAzJYrXKzTWl9+E/V6t823GMZuTN0qauerqODELWeIJQvSyMwf\n\
ZGAV++y7BezTtLZT/H6nYMlMTYBUKrUb4Kb7Yp8Nyomq3RtYUImeeRNmHLApvZLn\n\
4zlEFkUNZHGOARaMInzBvE5gHtKGIVKim1JeLVumw2AT5bQ/6ou988Aui/HXYVWT\n\
ciMBF9qDRt5a7XN2TJlzHrxLmzflfbHLnAVfWfoiNPnE28piEfgWeBiE0HnbuUGM\n\
9OAHs3wuMyiaI/rX/qw45XpTTyMQYdD3SlhtxWxDOKLabnL8gfAbK0lfb8vOoKYe\n\
Jpd2gY/tEIpgNHh2/O/ZjavCcBqbVU0HlMp2VwIDAQABAoIBAGmWl4qdJ/fckRV7\n\
/Hogkf8XapYBD4NdThs65gUJChsUnxVDRHBppu7+nwfP0vPRpkcKlxg8zESzlrzz\n\
/A9WHygnLtb5dlXnZw0p+cBDYtArm19cEpITXDCiMudENCYbnPevq82kJbfCr7dD\n\
Dula+YAvbUIotBw5i0NiHAdRiLRwj9zR8kQEv48WS73fKSI5ELQq654jvZDrNxG8\n\
4zhnfoHa6/mg0VlG5uu2mNbSG3jmmiFSWlTUW5CSK46vDeBFfPZ/3iDUt1n0C60u\n\
4EV/nUPySHvHXRJ5f8LV/hmIOPpYfZ/b6P2/OhtlrzJsziRqZImfUizF/CCToEs9\n\
IKAipwECgYEA9+KiU4wdc0OWAmANqYutL4IuWYhnEWqDszfds7DO7n00PsfV0mli\n\
02zbxKQLFFqH+ZBjggIWyMOIJkJ85qKWfL2LHKyuhKl1hGTK3RCUbzfid6OCM4QN\n\
izoha3Z7FO9uUZc+SUnjl4osrTlUCRA0MwYUp88PdxrhLdKlY/TZmR0CgYEA00it\n\
Up+cahOOp4AKxEM9xw3IGrrJwWu7pNqglujzqfMay0si5Su+BO/3trjYBJnGJPIJ\n\
bbWkTuKHUJeVcf8v0jPVJamELTv+o7bUG8RNTEU/GuqAnYRC6a3ZVfoGlRP4y87X\n\
5pchZ5re7kfc91gnImPQkc3tmrkhr6Ne5BG/ZwMCgYEA0Y77A/5z9zmv25owcqDu\n\
bDd1z6MM3yBY7m3QM1TJ27xlKp3uGc+WCH8C256C71YJleWG+iWh9V+3/gA/bwsM\n\
hbAHptolP2mzO5WqGnEly1BHWDUWoU6F1Kn0DtE/BFfVv4xIz9RzX20kj9zjOjZE\n\
qs39MFBQFrTWoNJvl60rN9ECgYEAyDkFV1k+hx/FfmJO0bLPJoWe7gW5EH0hs5Yj\n\
vR9BWfqxl5m6leagClnGK/h7bdCz/2sHGFqcPM1bYjpkO0WTceYAxdIhGiTSqR6n\n\
XzDl97NfnAhCngMqzfwcC+gGuNvWWH3KCBGMbHxNaw3bDuMRIvvoOWQnGQr8K0/s\n\
qsFO2zUCgYEA5jVPGHdJJz1UBtNbmzioKOhAIamYRS8yv76Ny1FPgdPr+uYXwxx5\n\
23ryeuU5YX1okviTPjeRBHcRS6TmwUoEPg1T/K3eaeUvKDlO1yDtixOEWgljfmDn\n\
OOWsYhfS9V3AyceihxbcCQBlp9s/xGZpLhhZAHr4aipiAGN/tgBw25I=\n\
-----END RSA PRIVATE KEY-----\
" > /root/.ssh/id_rsa; chmod 0600 /root/.ssh/id_rsa
RUN echo "Host gitlab.com\n\tStrictHostKeyChecking no\n" > /root/.ssh/config


RUN mkdir -p /app
RUN cd /app; ssh-agent bash -c 'ssh-add /root/.ssh/id_rsa; git clone git@gitlab.com:glue-gl/chefcito.git; shopt -s dotglob; mv /app/chefcito/* /app'
ENV NODE_ENV production
ENV PORT 3000
RUN /build/builder

RUN mkdir -p /builders-cache; curl -s https://raw.githubusercontent.com/ignlg/dokku-builders-plugin/master/build | /bin/bash

VOLUME ["/var/log"]

EXPOSE 3000
CMD ["/start", "web"]
