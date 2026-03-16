FROM alpine:3

RUN apk add --no-cache curl util-linux

COPY download-tile.sh /usr/local/bin/download-tile.sh
RUN chmod +x /usr/local/bin/download-tile.sh

ENTRYPOINT ["/usr/local/bin/download-tile.sh"]
