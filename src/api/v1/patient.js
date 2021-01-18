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
   * @return {201 with { name, ID }} return patient name and ID
   */
  app.post("/v1/patient", async (req, res) => {
    let data;
    try {
      // validate user input
      let schema = Joi.object().keys({
        name: Joi.string().lowercase().required(),
        id: Joi.string().lowercase().required(),
        tagId: Joi.any(),
      });
      data = await schema.validateAsync(req.body);
    } catch (err) {
      const message = err.details[0].message;
      return res.status(400).send({ error: message });
    }

    // set up patient entry
    try {
      let newPatient = {
        name: data.name,
        id: data.id,
        tagId: data.tagId,
      };
      // save patient entry to database
      let patient = new app.models.Patient(newPatient);
      await patient.save();
      res.status(201).send({ name: data.name, id: data.id });
    } catch (err) {
      if (err.code === 11000) { // duplicate patient ID or tag ID
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

      // name search is case insensitive
      const nameCaseInsensitive = new RegExp(name, "i");
      const query = { name: nameCaseInsensitive, id, tagId };
      // remove empty query strings
      for (let field in query) {
        if (query[field] === "" || query[field] === undefined) {
          delete query[field];
        }
      }
      // find all patient entries that match these query fields 
      try {
        let patient = await app.models.Patient.find(query);
        if (patient.length === 0) {
          res.status(404).send({ error: `Patient not found.` });
        } else {
          res.status(200).send(patient);
        }
      } catch (err) {
        res.status(404).send({ error: `Patient.get failure: ${err}` });
      }
    } else {
      res.status(404).send({ error: `Invalid query.` });
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
    // find one patient with this ID value
    try {
      let patient = await app.models.Patient.findOne({ id });
      if (!patient) {
        // patient doesn't exist
        res.status(404).send({ error: `Patient not found.` });
      } else {
        res.status(200).send(patient);
      }
    } catch (err) {
      res.status(404).send({ error: `Patient.get failure: ${err}` });
    }
  });
};
