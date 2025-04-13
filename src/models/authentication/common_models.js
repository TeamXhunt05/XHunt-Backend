const mongoose = require("mongoose");
const { Schema } = mongoose;

const languageSchema = new Schema({
  title: {
    type: String,
    default: "English",
  },
  code: {
    type: String,
    default: "en",
  },
});



const ImagesSchema = new Schema({
  title: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    required: false,
    default: "",
  },
});


const geoLocactionSchema = new Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number]
  }
});  

module.exports = { languageSchema, ImagesSchema,geoLocactionSchema };
