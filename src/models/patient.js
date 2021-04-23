"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/***************** Patient Model *******************/

// Schema for patient
// Each patient has a name, a patient ID given by the hospital,
// a tag ID corresponding to an RFIV, and an array of locations
// which will hold locations in the form [timestamp, location]
let Patient = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, index: { unique: true } },
  tagId: { type: String, index: { unique: true } },
  locations: [[]],
});

Patient.pre("validate", function (next) {
  // Sanitize strings
  this.name = this.name.replace(/<(?:.|\n)*?>/gm, "");
  this.id = this.id.replace(/<(?:.|\n)*?>/gm, "");
  this.tagId = this.tagId.replace(/<(?:.|\n)*?>/gm, "");
  next();
});

module.exports = mongoose.model("Patient", Patient);
