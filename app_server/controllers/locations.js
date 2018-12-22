const request = require("request");
const apiOptions = {
  server: "http://localhost:3000"
};
if (process.env.NODE_ENV === "production") {
  apiOptions.server = "https://loc8r-xxw.herokuapp.com";
}

//Display Error func
const showError = (req, res, status) => {
  let title = "";
  let content = "";
  if (status === 404) {
    title = "404, page not found";
    content = "Oh dear. Looks like we can't find this page. Sorry.";
  } else {
    title = `${status}, something's gone wrong`;
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  res.status(status);
  res.render("generic-text", {
    title,
    content
  });
};

const renderHomepage = (req, res, responseBody) => {
  let message = null;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No places found nearby";
    }
  }
  res.render("locations-list", {
    title: "Loc8r - find a place to work with wifi",
    pageHeader: {
      title: "Loc8r",
      strapline: "Find places to work with wifi near you!"
    },
    sidebar:
      "Looking for wifi and a seat? Loc8r helps you find placed to work when out and about.",
    locations: responseBody,
    message
  });
};

const formatDistance = distance => {
  let thisDistance = 0;
  let unit = "m";
  if (distance > 1000) {
    thisDistance = parseFloat(distance / 1000).toFixed(1);
    unit = "km";
  } else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
};

module.exports.homelist = function(req, res) {
  const path = "/api/locations";
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: "GET",
    json: {},
    qs: {
      lng: -0.7992599,
      lat: 51.378091,
      maxDistance: 20
    }
  };
  //request module as http client making API call
  //{statusCode} : statusCode = response.statusCode
  request(requestOptions, (err, { statusCode }, body) => {
    let data = [];
    if (statusCode === 200 && body.length) {
      data = body.map(item => {
        item.distance = formatDistance(item.distance);
        return item;
      });
    }
    renderHomepage(req, res, data);
  });
};

//ReadOne api call
const renderDetailPage = (req, res, location) => {
  res.render("location-info", {
    title: location.name,
    pageHeader: { title: location.name },
    sidebar: {
      context:
        "is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.",
      callToAction:
        "If you've been and you like it - or if you don't please leave a review to help other people just like you."
    },
    location
  });
};

//getLocationInfo controller make the code DRY adding callback for both locationInfo and AddReview
const getLocationInfo = (req, res, callback) => {
  const apiPath = "/api/locations/";
  const path = `${apiPath}${req.params.locationid}`;
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: "GET",
    json: {}
  };
  request(requestOptions, (err, { statusCode }, body) => {
    let data = body;
    if (statusCode === 200) {
      data.coords = {
        lng: body.coords[0],
        lat: body.coords[1]
      };
      callback(req, res, data);
    } else {
      showError(req, res, statusCode);
    }
  });
};

module.exports.locationInfo = (req, res) => {
  getLocationInfo(req, res, (req, res, responseData) =>
    renderDetailPage(req, res, responseData)
  );
};
// Add Review
const renderReviewForm = (req, res, { name }) => {
  res.render("location-review-form", {
    title: `Review ${name} on Loc8r`,
    pageHeader: { title: `Review ${name}` },
    error: req.query.err
  });
};

module.exports.addReview = (req, res) => {
  getLocationInfo(req, res, (req, res, responseData) =>
    renderReviewForm(req, res, responseData)
  );
};

module.exports.doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const postData = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const apiPath = "/api/locations/";
  const path = `${apiPath}${locationid}/reviews`;
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: "POST",
    json: postData
  };
  if(!postData.author || !postData.rating){
    res.redirect(`/locations/${locationid}/review/new?err=val`);
  }else{
    request(requestOptions, (err, { statusCode }, body) => {
      if (statusCode === 201) {
        res.redirect(`/locations/${locationid}`);
      } else if (statusCode === 400 && name && name === "ValidationError") {
        res.redirect(`/locations/${locationid}/review/new?err=val`);
      } else {
        showError(req, res, statusCode);
      }
    });
  }
};
