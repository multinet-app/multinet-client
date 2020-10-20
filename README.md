# multinet-client

This is the web client for the Multinet project. It is a VueJS application that
works in conjunction with the [Multinet
server](https://github.com/multinet-app/multinet-server) to provide a user
interface to the system.

## Quick Start

1. Be sure that Yarn is installed on your system.
2. Check out this repository, then move into it (e.g., `cd multinet-client`).
3. Install the project dependencies: `yarn install`.
4. Copy the default application registry (`yarn init-appregistry`)
   * If running the visualization applications locally, update these values in `src/assets/appregistry.json`
5. Serve the client app in dev mode: `yarn serve`.
6. Follow the [quick start instructions](https://github.com/multinet-app/multinet-server#quick-start) for the Multinet server.
7. Point your web browser at http://localhost:8080 to see if the client is
   running.

For further details on how the client and the Multinet system itself work, please
see the [full documentation](https://multinet-app.readthedocs.io).
