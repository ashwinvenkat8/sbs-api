# sbs-api

Built with **Express.js 4.18.3**

### Project setup
1. Create a `.env` file and add the following:
    ```
    NODE_ENV=<ENV>
    APP_PORT=<PORT>
    API_BASE=<VERSIONED_API_BASE_PATH>
    HEALTHCHECK=<HEALTHCHECK_API_BASE_PATH>
    MONGO_URI=<DB_CONNECTION_STRING>
    SECRET_KEY=<YOUR_SECRET>
    ```
    where:
    - `NODE_ENV` = `development` or `production`.
    - `APP_PORT` = `5000` or any other available port.
    - `API_BASE` = `/api/v1`.
    - `HEALTHCHECK` = `http://localhost:5000/api/v1/status`.
    - `MONGO_URI` can be found in Atlas.
    - `SECRET_KEY` can be generated using `openssl`.

2. Install dependencies: `npm install`

3. Run application: `npm run start:dev`

### API Testing using Postman

[Postman](https://www.postman.com/downloads/) can be used to test the APIs before integrating with the front-end. To do so, use the JSON files present in the `postman` directory. First import the `sbs-api.postman_environment.json` file to ensure the required environment variables are available to the requests. Then, import the `sbs-api.postman_collection.json` file to run requests.

If you are not familiar with importing collections and environments to your Postman workspace, refer [Data import and export in Postman | Postman Learning Center](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-and-exporting-overview/)

### Build application
**Command:** `npm run build`

**Docker command:** `docker build -t <IMAGE>:<TAG> .`

***Note:**
Follow [semantic versioning](https://semver.org/) scheme `X.Y.Z` for image `<TAG>`.*

### Run application
**Command:** `npm run start:prod`

**Docker command:** `docker run --name=<CONTAINER_NAME> [-e <ENV_VAR_NAME>=<ENV_VAR_VALUE>] [-v <HOST_PATH>:<CONTAINER_PATH>] -dp <HOST_PORT>:<CONTAINER_PORT> <IMAGE>:<TAG>`

***Note:** Provide environment variables and mount required files using `-e` and `-v` options. Refer: [docker run | Docker Docs](https://docs.docker.com/engine/reference/commandline/container_run/)*

### Requirements
- [MongoDB Atlas](https://mongodb.com/atlas)
- [Express.js 4.18.3](https://expressjs.com/en/changelog/4x.html)
- [Node.js 20.9.0](https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V20.md#20.9.0)
- [Docker 24.0.5](https://docs.docker.com/engine/release-notes/24.0/#2405)
- [Ubuntu 20.04.6 LTS](https://wiki.ubuntu.com/FocalFossa/ReleaseNotes)