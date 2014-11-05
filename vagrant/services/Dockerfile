FROM progrium/buildstep
MAINTAINER Glue <hola@glue.gl>

RUN mkdir -p /root/.ssh; echo "\
-----BEGIN RSA PRIVATE KEY-----\n\
MIIEpQIBAAKCAQEAyzOOU/qbZCnJH3g8rqe4Xhq6Jg+4/zSr5gc2xpCT3KuIF8K7\n\
/E0Ea/5dddU33CqeE7LgA7czxs0Ta+wEtDAhD3xmUzFsz/odgAImOwcvTy0mVcfF\n\
2NenaCkskrkADQNJ4HqsuxvuyM5zy0ttuxgHHPnGFMH6cm+qcbQjRWU7hzlh8ygo\n\
+NV/at4RDp9SWWqIi24Y3eLo3B/zN4KQXe+LOSbb3ay8gr/cjgqpimb7YQA0kfev\n\
1tccdaeD9p7lNrbeI1TzBkG5jlrChWvq0g48T7wfbOSf+a1D3eYQthEI8Kb7Ynpr\n\
w0T9NxB77k6Nr2TW0OBqRufKkHNQvvhcYik0BQIDAQABAoIBAQCbR3WPBSXz396a\n\
lsZAbVh9SQ1RApjLJNPrfz3DdT4Y1le0WJJQ1gX4BLQk1F/QdhzATuPS0w/U7mfW\n\
A9EAZPsOm3CSSGWvdKFQbdQLLY1ggs8VpAizkPCTr0spgAfi6c1tpjES9uB9QQ7J\n\
noVnAJCG+vP8btNU2bI1G4QMhrR7uudnEjNy09YoQZLg+aQKO4iXPkLMmKGfZsRk\n\
U1kEj+DT4eaW73MZPgyeJlqRCkXOyIDESRUf3xHmQ7YpX81e1MpNZ7mKN0MgbEEO\n\
dF34heAAkOTOSw8ZAfMFUqzFuqeSQUsNldryyQu/j1siaXJTcfrzV96DL8p+Yu2r\n\
nhlIroFNAoGBAPXbyxQGFmy74LQecrjuxE0ZjViYhXeeCGHIrDz9xYxzES6vryok\n\
/oTj8tFQHGF9CAVAt6PqgPbrW0hC32/nSd0EJr67AMXqit6TfmO26VNTnVrrdoEd\n\
P0HdsaB9xw5Os02Omw6KsDsd5YL5VZCxC3cZ4mygsRikoKGdD2oGJRgLAoGBANOV\n\
UDKYluumZfVWDu+XMe5oQijl+mbUbktpgxrqy111mNCyW7geK3kAhbEbD0PcKDy/\n\
OCg3f4wxKq7NYiKIb5xVQdlQ3g20xqLAbH2O0rs+MI9Bf6LsBnwx7uXmWd6tVhvT\n\
y9rnmexlCmMICU5jVF4T0RhnWnFhNNLe7VqAaZ4vAoGBAICAht5KaEIg2MuL9o5u\n\
Ta+2oUgjP+9LbDofttaSFUTZh6uNK9KtT1KKCgoZAxx5S03ji5hjI1DrpuRX/4zv\n\
qI2ac93QxBCuDDNViAP6QG3LED3LQD8v2DZG92ZZF0eFHvZ0iNrK5l2fvKv+QhjE\n\
UKfJoa0BOE8XDNYrzzitSYoNAoGBAKUvFA58PI87OKyCBGUe+Dd1o/lEGur+/CDZ\n\
/iYcmqqbbbO5G4wx2aS9OKLdSlyjW7KZYyFaurRbikQwSmZFeEVn9mHQFZxDvzQ+\n\
4DRiNblDQywEab5rYGDDpwxLe2wyjWBqSOPdHrmE5MgN9R4CxFIyTHMt9VlBF7lt\n\
m4albE+3AoGAUpj1OCt8lb6XOQQtB4om3lIM0XcxY0Zw/LWfjNGPGaHsa0bYv6bj\n\
VbPvNgsHqeUClKAY3d2ooFh43qcDAi5WoyLPUcmXRsmvyaHs75nI2EC0zH0uHQZj\n\
RhyaCLOhJLgYihtKkldBBN33kLI2v2s+VYjzq9FWyDQAqRqinZcdnEE=\n\
-----END RSA PRIVATE KEY-----\
" > /root/.ssh/id_rsa; chmod 0600 /root/.ssh/id_rsa
RUN echo "Host git.geekli.st\n\tStrictHostKeyChecking no\n" > /root/.ssh/config


RUN mkdir -p /app
RUN cd /app; ssh-agent bash -c 'ssh-add /root/.ssh/id_rsa; git clone git@git.geekli.st:glue-gl/chefcito.git; shopt -s dotglob; mv /app/chefcito/* /app'
ENV NODE_ENV production
ENV PORT 3000
RUN /build/builder

RUN mkdir -p /builders-cache; curl -s https://raw.githubusercontent.com/ignlg/dokku-builders-plugin/master/build | /bin/bash

EXPOSE 3000
CMD ["/start", "web"]