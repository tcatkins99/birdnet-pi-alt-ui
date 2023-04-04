# BirdNET-Pi Front End

This is a custom *work in progress* front end for [BirdNET-Pi](https://github.com/mcguirepr89/BirdNET-Pi).

## Installation

### Pepare BirdNET-Pi 
**TODO**: Explain how to add the php files, flickr cache and caddy setup for the "api".

### Build the Front-End
1. Clone the repo and run `npm install`. 

2. If this front end will be installed on a web server that is different than the BirdeNET-Pi host, create a `env.local` file in the root diretory and add a variable for `VITE_API_HOST`:

    ```
    VITE_API_HOST=https://example.org
    ```

3. Run `npm run build` to build the site and upload the contents of the `dist` directory to a webserver.

## More Info
This project uses [React](https://react.dev) and is written in [Typescript](https://www.typescriptlang.org).

Additionally, it uses a few other key libraries: [React Bootstrap](https://react-bootstrap.github.io), [React Router](https://reactrouter.com/en/main), [React Query](https://tanstack.com/query/v3/), and [Vite](https://vitejs.dev).
