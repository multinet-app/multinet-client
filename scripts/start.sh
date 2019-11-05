#!/bin/sh

# Consult the lockfile first.
if [ -e server.pid ]; then
    echo "Client already running" >/dev/stderr
    exit 1
fi

FLASK_SERVE_PORT=50000 nohup yarn serve >server.out &
echo $! >server.pid

# Loop until the server is up.
started=0
count=0

echo -n "waiting for client to come up"
while [ ${started} = 0 ] && [ ${count} -lt 30 ]; do
    headers=$(curl -s -I --max-time 0.5 http://localhost:8080/api/workspaces)
    curl_status=$?

    if [ ${curl_status} = 0 ]; then
        result=$(echo ${headers} | head -1 | grep 200)
        good=$?
        if [ ${good} = 0 ]; then
            started=1
        fi
    fi

    sleep 1
    count=$(expr ${count} + 1)
    echo -n .
done

if [ ${started} = 1 ]; then
    true
else
    false
fi