const db = require ("../models");

const User = db.user;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const signupController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const {
        name,
        email,
        password,
        account_type,
      } = req.body;
  
      if (
        !email ||
        !password ||
        !name ||
        !account_type
      ) {
        return res.send(error(400, "All fields are required"));
      }
  
      const oldUser = await User.findOne({ where: { email } });
      if (oldUser) {
        return res.status(400).json({"msg":"user is already registered"});
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await User.create({
        name,
        email,
        account_type,
        password: hashedPassword,
      });
  
      const accessToken = generateAccessToken({ user });
  
      return res.status(200).json({accessToken:accessToken,user:user});
    } catch (e) {
      console.log(e);
      return res.status(400).json({"msg":"something went wrong"});
    }
  };

  const loginController = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({"msg":"all fields are required"});
      }
  
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({"msg":"user is not registered"});
      }
  
      const matched = await bcrypt.compare(password, user.password);
      if (!matched) {
        return res.status(400).json({"msg":"incorrect password"});
      }
  
      const accessToken = generateAccessToken({ user });
  
      return res.status(200).json({accessToken:accessToken,user:user});
    } catch (e) {
      console.log(e);
      return res.status(200).json({"msg":"something went wrong"});
    }
  };

  const generateAccessToken = (data) => {
    try {
      const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
        expiresIn: "1h",
      });
      return token;
    } catch (error) {
      console.log(error);
      return res.status(200).json({"msg":"something went wrong"});
    }
  };

  module.exports = {
    generateAccessToken,
    loginController,
    signupController
  }