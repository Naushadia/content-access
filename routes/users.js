const router = require("express").Router();
const authController = require('../controller/authController');
const { body } = require('express-validator');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post(
  "/signup",
  body("name").isString(),
  body("email").isEmail(),
  body("account_type").isString(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password length must be greater than or equal to 8"),
  authController.signupController
);
router.post(
  "/login",
  body("email").isEmail(),
  body("password"),
  authController.loginController
);

module.exports = router;
