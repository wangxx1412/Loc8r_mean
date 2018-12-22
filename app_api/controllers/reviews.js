const mongoose = require("mongoose");
const Loc = mongoose.model("Location");

//POST a review
const doSetAverageRating = location => {
  if (location.reviews && location.reviews.length > 0) {
    const count = location.reviews.length;
    const total = location.reviews.reduce((acc, { rating }) => {
      return acc + rating;
    }, 0);
    location.rating = parseInt(total / count, 10);
    location.save(err => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Average rating updated to ${location.rating}`);
      }
    });
  }
};

const updateAverageRating = locationID => {
  Loc.findById(locationID)
    .select("rating reviews")
    .exec((err, location) => {
      if (err) {
        console.log(err);
      } else {
        doSetAverageRating(location);
      }
    });
};

const doAddReview = (req, res, location) => {
  if (!location) {
    res.status(404).json({ message: "location not found" });
  } else {
    const { author, rating, reviewText } = req.body;
    location.reviews.push({ author, rating, reviewText });
    //second par location is saved location
    location.save((err, location) => {
      if (err) {
        console.log(err);
        res.status(400).json(err);
      } else {
        updateAverageRating(location._id);
        const thisReview = location.reviews.slice(-1).pop();
        res.status(201).json(thisReview);
      }
    });
  }
};

const reviewsCreate = (req, res) => {
  locationID = req.params.locationid;
  if (locationID) {
    Loc.findById(locationID)
      .select("reviews")
      .exec((err, location) => {
        if (err) {
          res.status(400).json(err);
        } else {
          doAddReview(req, res, location);
        }
      });
  } else {
    res.status(404).json({ message: "Location not found" });
  }
};

//Controller for GET single revivew
const reviewsReadOne = (req, res) => {
  Loc.findById(req.params.locationid)
    //mongoose method select for the property we want
    .select("name reviews")
    .exec((err, location) => {
      if (!location) {
        return res.status(404).json({
          message: "location not found"
        });
      } else if (err) {
        return res.status(400).json(err);
      }
      //Check that the returned location has reviews
      if (location.reviews && location.reviews.length > 0) {
        //mongoose subdoc.id method helper for searching
        const review = location.reviews.id(req.params.reviewid);
        if (!review) {
          return res.status(404).json({
            message: "review not found"
          });
        } else {
          //build the response we need, not the whole doc
          response = {
            location: {
              name: location.name,
              id: req.params.locationid
            },
            review
          };
          return res.status(200).json(response);
        }
      } else {
        return res.status(404).json({
          message: "No reviews found"
        });
      }
    });
};

//PUT
const reviewsUpdateOne = (req, res) => {
  if (!req.params.locationid || !req.params.reviewid) {
    return res.status(404).json({
      message: "Not found, locationid and reviewid are both required"
    });
  }
  Loc.findById(req.params.locationid)
    .select("reviews")
    .exec((err, location) => {
      if (!location) {
        return res.status(404).json({
          message: "Location not found"
        });
      } else if (err) {
        return res.status(400).json(err);
      }
      if (location.reviews && location.reviews.length > 0) {
        const thisReview = location.reviews.id(req.params.reviewid);
        if (!thisReview) {
          res.status(404).json({
            message: "Review not found"
          });
        } else {
          thisReview.author = req.body.author;
          thisReview.rating = req.body.rating;
          thisReview.reviewText = req.body.reviewText;
          location.save((err, location) => {
            if (err) {
              res.status(404).json(err);
            } else {
              updateAverageRating(location._id);
              res.status(200).json(thisReview);
            }
          });
        }
      } else {
        res.status(404).json({
          message: "No review to update"
        });
      }
    });
};

const reviewsDeleteOne = (req, res) => {
  const { locationid, reviewid } = req.params;
  if (!locationid || !reviewid) {
    return res
      .status(404)
      .json({
        message: "Not found, locationid and reviewid are both required"
      });
  }
  Loc.findById(locationid)
    .select("reviews")
    .exec((err, location) => {
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      } else if (err) {
        return res.status(400).json(err);
      }
      if (location.reviews && location.reviews.length > 0) {
        if (!location.reviews.id(reviewid)) {
          return res.status(404).json({ message: "Review not found" });
        } else {
          location.reviews.id(reviewid).remove();
          location.save(err => {
            if (err) {
              return res.status(404).json(err);
            } else {
              updateAverageRating(location._id);
              res.status(204).json(null);
            }
          });
        }
      } else {
        res.status(404).json({ message: "No Review to delete" });
      }
    });
};

module.exports = {
  reviewsCreate,
  reviewsReadOne,
  reviewsDeleteOne,
  reviewsUpdateOne
};
