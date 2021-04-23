# rfiv-server

This code creates several API endpoints for saving and retrieving patient data from a MongoDB Atlas database. The API code is located in [src/api](src/api), and the patient document schema for MongoDB is located in [src/models](src/models).

## Setup

`Note`: Node.js is required to run this code. Download it at https://nodejs.org/en/.

`Note`: The server connects to a MongoDB database. A `config.json` file needs to be included in this directory. The code expects a file with the following structure:
```JSON
{
  "mongodb": "<connection_string>"
}
```
where `<connection_string>` is the connection string to a MongoDB database. Our connection string is in the form `mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.muah1.mongodb.net/rfivDB?retryWrites=true&w=majority`, where `<USERNAME>` and `<PASSWORD>` are the username and password of a database user, respectively, and the name of the database is "rfivDB". We used [Mongoose](https://mongoosejs.com/) to connect to the database. See the [docs](https://mongoosejs.com/docs/connections.html) for more info.

In the project directory, run the following commands in the terminal:

### `npm install`

Installs the necessary packages.

### `npm start`

Starts the server.

## Available API Endpoints

From the host `http://localhost:8080`, the following endpoints are available:

* `POST /v1/patient`

  Creates a new patient entry with the name, patient ID, and tag ID specified in the request body.

* `GET /v1/patients?name=&id=&tagId=`

  Returns a list of patient entries that have names, patient IDs, and/or tag IDs that match the query strings.

* `GET /v1/patient/:id`

  Returns the patient entry that has the specified patient ID parameter.

* `PUT /v1/patient/:id`

  Edits the name and/or tag ID of the patient entry associated with the specified patient ID parameter.

* `POST /v1/patient/:tagId/location`

  Adds a location datapoint to a patient entry associated with the specified tag ID parameter.

  Note: This endpoint is currently unused because the RFID readers are directly interacting with the database. This was done because this server is being run locally, so the readers cannot connect to it; however, if the server is put on the Internet in the future, the use of this endpoint is preferred.

## Interaction with the User Interface

The code located in the [rfiv-ui repository](https://github.com/ManeuverOn/rfiv-ui) serves as the frontend for the RFIV tracking app. The code in this repository handles the server logic for database transactions. Both `rfiv-ui` and `rfiv-server` must be running for the whole application to work.