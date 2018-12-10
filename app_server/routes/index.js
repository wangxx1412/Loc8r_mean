var express = require('express');
var router = express.Router();
var ctrlLocation = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* GET home page. */
router.get('/', ctrlLocation.homelist);
router.get('/locations', ctrlLocation.locationInfo);
router.get('/locations/review/new', ctrlLocation.addReview);

router.get('/about', ctrlOthers.about);

module.exports = router;
