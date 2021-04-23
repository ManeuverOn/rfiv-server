"use strict";

const { isEmpty } = require("../../shared");

const Joi = require("joi");
const mongoose = require("mongoose");

module.exports = (app) => {
  /**
   * Add a new patient entry
   *
   * @param {req.body.name} Name of patient
   * @param {req.body.id} ID of patient
   * @param {req.body.tagId} ID of RFIV Tag
   * @return {204, no body content} Return status only
   */
  app.post("/v1/patient", async (req, res) => {
    let data;
    try {
      // validate user input
      let schema = Joi.object().keys({
        name: Joi.string().required(),
        id: Joi.string().required(),
        tagId: Joi.string().required(),
      });
      data = await schema.validateAsync(req.body);
    } catch (err) {
      const message = err.details[0].message;
      return res.status(400).send({ error: message });
    }

    try {
      // save patient entry to database
      let patient = new app.models.Patient(data);
      await patient.save();
      res.status(204).send();
    } catch (err) {
      if (err.code === 11000) {
        // duplicate patient ID or tag ID
        if (err.message.indexOf("id_1") !== -1)
          res.status(400).send({ error: "Patient ID already in use" });
        if (err.message.indexOf("tagId_1") !== -1)
          res.status(400).send({ error: "Tag ID already in use" });
      }
    }
  });

  /**
   * Search for patients by at least one of name, patient id, or tag ID
   *
   * @param {req.query.name} Name of patient
   * @param {req.query.id} ID of patient
   * @param {req.query.tagId} ID of RFIV Tag
   * @return {200 with { name, ID, tag ID }} return patient names, IDs, and tag IDs
   */
  app.get("/v1/patients", async (req, res) => {
    if (!isEmpty(req.query)) {
      const name = req.query.name;
      const id = req.query.id;
      const tagId = req.query.tagId;

      // search by name is case insensitive
      // search is "contains" search instead of "starts with"
      const query = {
        name: new RegExp(name, "i"),
        id: new RegExp(id),
        tagId: new RegExp(tagId),
      };

      // remove empty query strings
      for (let field in query) {
        if (query[field] === "" || query[field] === undefined) {
          delete query[field];
        }
      }

      // find all patient entries that match these query fields
      try {
        let patients = await app.models.Patient.find(query);
        if (patients.length === 0) {
          // no patients found
          res
            .status(404)
            .send({ error: "No patients found.", query: { name, id, tagId } });
        } else {
          // send list of patients and the search query
          res.status(200).send({ patients, query: { name, id, tagId } });
        }
      } catch (err) {
        res.status(404).send({
          error: `Patients.get failure: ${err}`,
          query: { name, id, tagId },
        });
      }
    } else {
      res.status(400).send({ error: "Empty query." });
    }
  });

  /**
   * Search for a patient entry by patient id
   *
   * @param {req.params.id} ID of patient
   * @return {200 with { name, ID, tag ID }} return patient name, ID, and tag ID
   */
  app.get("/v1/patient/:id", async (req, res) => {
    const id = req.params.id;
    // find patient with this ID value
    try {
      let patient = await app.models.Patient.findOne({ id });
      if (!patient) {
        // patient doesn't exist
        res.status(404).send({ error: `Patient not found.` });
      } else {
        // send patient document
        res.status(200).send({ patient });
      }
    } catch (err) {
      res.status(404).send({ error: `Patient.get failure: ${err}` });
    }
  });

  /**
   * Edit a patient's info
   *
   * @param {req.params.id} ID of patient
   * @param {req.body.name} New name
   * @param {req.body.tagId} New Tag ID
   * @return {200 with {name, ID tag ID}} return new patient name, ID, and/or tag ID
   */
  app.put("/v1/patient/:id", async (req, res) => {
    let data;
    try {
      // validate user input
      let schema = Joi.object().keys({
        name: Joi.string(),
        tagId: Joi.string(),
      });
      data = await schema.validateAsync(req.body);
    } catch (err) {
      const message = err.details[0].message;
      return res.status(400).send({ error: message });
    }

    // update patient info
    if (!isEmpty(data)) {
      const id = req.params.id;
      try {
        // find patient entry with this ID and update relevant info
        let patient = await app.models.Patient.findOneAndUpdate(
          { id },
          { $set: data }
        );
        if (!patient) {
          // ID doesn't exist
          res.status(404).send({ error: "ID not found." });
        } else {
          res.status(204).send();
        }
      } catch (err) {
        if (err.code === 11000) {
          // duplicate tag ID
          if (err.message.indexOf("tagId_1") !== -1)
            res.status(400).send({ error: "Tag ID already in use" });
        }
      }
    } else {
      res.status(400).send({ error: "Invalid query." });
    }
  });

  /**
   * Add a location to a patient associated with a tag ID (currently unused)
   *
   * @param {req.params.tagId} Tag ID of patient
   * @param {req.body.timestamp} time of tracker reading
   * @param {req.body.location} location of tracker reading
   * @return {204, no body content} Return status only
   */
  app.post("/v1/patient/:tagId/location", async (req, res) => {
    let data;
    try {
      // validate user input
      let schema = Joi.object().keys({
        timestamp: Joi.number().required(),
        location: Joi.string().required(),
      });
      data = await schema.validateAsync(req.body);
    } catch (err) {
      const message = err.details[0].message;
      return res.status(400).send({ error: message });
    }

    // try to save location
    try {
      // get the patient entry with this tag ID
      const tagId = req.params.tagId;
      let patient = await app.models.Patient.findOne({ tagId });

      // if the tag is associated with a patient, save to database
      if (patient) {
        // get the last location/time if it exists
        let lastLocation = [0, ""];
        if (patient.locations.length > 0) {
          lastLocation = patient.locations[patient.locations.length - 1];
        }

        // if the current location is different from the last location, add it to the database
        // or if it's been over 120 seconds regardless of the location, add it to the database
        // otherwise, don't add it to save space in database
        if (
          data.location !== lastLocation[1] ||
          data.timestamp - lastLocation[0] > 120000
        ) {
          await app.models.Patient.updateOne(
            { _id: patient._id },
            { $push: { locations: [data.timestamp, data.location] } }
          );
          res.status(204).send();
        } else {
          // tag was read too soon
          return res.status(405).send({
            error: `The tag (${tagId}) was recently read in this location.`,
          });
        }
      } else {
        // tag not found in database
        res
          .status(404)
          .send({ error: `This tag (${tagId}) is not in the database.` });
      }
    } catch (err) {
      res.status(400).send({ error: `Patient.post failure: ${err}` });
    }
  });
};
