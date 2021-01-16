"use strict";

const Joi = require("joi");
const mongoose = require("mongoose");

module.exports = (app) => {
  /**
   * Add a new patient entry
   *
   * @param {req.body.name} Name of patient
   * @param {req.body.id} ID of patient
   * @param {req.body.tagId} ID of RFIV Tag
   * @return {201 with { id: ID of new patient entry }}
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
      console.log(`Patient.create validation failure: ${message}`);
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
      res.status(201).send({ id: patient._id });
    } catch (err) {
      console.log(`Patient.create save failure: ${err}`);
      res.status(400).send({ error: "failure creating patient entry" });
    }
  });

  /**
   * Search for a patient entry by name
   *
   * @param (req.params.name} Name of patient to search for
   * @return {200} Patient information
   */
  app.get("/v1/patient/:name", async (req, res) => {
    try {
      let patient = await app.models.Patient.find({
        name: req.params.name,
      });
      if (!patient) {
        res.status(404).send({ error: `Unknown patient: ${req.params.name}` });
      } else {
        res.status(200).send(patient);
      }
    } catch (err) {
      console.log(`Patient.get by name failure: ${err}`);
      res.status(404).send({ error: `Unknown patient: ${req.params.name}` });
    }
  });
};
