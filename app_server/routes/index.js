var express = require('express');
var router = express.Router();
var ctrlLocation = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* GET home page. */
router.get('/', ctrlLocation.homelist);
router.get('/locations/:locationid', ctrlLocation.locationInfo);
router
  .route('/locations/:locationid/review/new')
  .get(ctrlLocation.addReview)
  .post(ctrlLocation.doAddReview)

router.get('/about', ctrlOthers.about);

module.exports = router;
