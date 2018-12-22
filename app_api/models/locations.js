const mongoose = require("mongoose");
//Mongoose Schema for all data
const openningTimeSchema = new mongoose.Schema({
  days: { type: String, required: true },
  opening: String,
  closing: String,
  closed: {
    type: Boolean,
    required: true
  }
});
//
const reviewSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  reviewText: {
    type: String
  },
  createdOn: { type: Date, default: Date.now }
});

//Main Schema
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  facilities: [String],
  //mongoose example for GeoJSON(Point) object Schema
  coords: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number]
    }
  },
  openningTimes: [openningTimeSchema],
  reviews: [reviewSchema]
});
//2dsphere support for GeoJSON longitude and latitude cooords pairs
locationSchema.index({ coords: "2dsphere" });
//Compile schema into model for application
mongoose.model("Location", locationSchema);
