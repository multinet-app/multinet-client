#/bin/sh

# Kill the server and remove the lockfile.
if [ -e server.pid ]; then
    pid=$(cat server.pid)
    kill ${pid}
    rm server.pid
fi