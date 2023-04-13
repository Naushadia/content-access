const router = require("express").Router();
const upload = require('../utils/multer');
const role = require('../middleware/requireUser');
const contentController = require('../controller/contentController');
const {body} = require('express-validator');

router.post('/upload-video',role.admin,upload.array("video"),contentController.addVideo);

router.post('/authenticate',role.admin,contentController.authenticate);

router.get('/videos',role.user,contentController.getVideo);

module.exports = router;
