# rfiv-server

## Available Scripts

`Note`: Node.js is required to run this code. Download it at https://nodejs.org/en/.

In the project directory, you can run:

### `npm install`

Installs the necessary packages.

### `npm start`

Starts the server.

## Available APIs

This code creates several API endpoints for saving and retrieving patient data from a MongoDB Atlas database. From the host `http://localhost:8080`, you can run:

### `GET /v1/patients?name=&id=&tagId=`

Returns patient entries that have names, patient IDs, and tag IDs that match the query strings.

### `GET /v1/patient/:id`

Returns the patient entry that has the specified patient ID parameter.

### `POST /v1/patient`

Creates a new patient entry with the name, patient ID, and tag ID specified in the request body.

### `POST /v1/patient/:tagId/location`

Adds a location datapoint to a patient entry associated with the specified tag ID parameter.

## Interaction with the User Interface

The code located in the [rfiv-ui repository](https://github.com/dj4zhang/rfiv-ui) serves as the frontend for the RFIV tracking app. The code in this repository handles the server logic for database transactions. Both `rfiv-ui` and `rfiv-server` must be running for the whole application to work.