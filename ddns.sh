#!/bin/bash

DDNS_HOSTNAME="nats.codegangsta.dev"
DDNS_IP=$(ipconfig getifaddr en0)

curl -s -u $DDNS_USER:$DDNS_PASS "https://domains.google.com/nic/update?hostname=$DDNS_HOSTNAME&myip=$DDNS_IP"
