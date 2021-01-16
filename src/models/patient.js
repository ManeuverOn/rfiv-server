"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/***************** Patient Model *******************/

/* Schema for patient */
let Patient = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  tagId: { type: String },
});

Patient.pre("validate", function(next) {
  // Sanitize strings
  this.name = this.name.replace(/<(?:.|\n)*?>/gm, "");
  this.id = this.id.replace(/<(?:.|\n)*?>/gm, "");
  this.tagId = this.tagId.replace(/<(?:.|\n)*?>/gm, "");
  next();
});

module.exports = mongoose.model("Patient", Patient);
