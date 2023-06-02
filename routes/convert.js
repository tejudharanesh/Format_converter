const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const router = express();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(express.static('public'));


module.exports = router; 

