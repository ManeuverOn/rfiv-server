"use strict";

// checks if an object is empty
// adapted from Christoph at https://stackoverflow.com/a/679937
const isEmpty = (obj) => {
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};

module.exports = {
    isEmpty
};
