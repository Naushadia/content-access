const db = require("../models");
const { validationResult } = require("express-validator");
const content = require("../models/content");
const { where, Op, Sequelize } = require("sequelize");

const User = db.user;
const contentAccess = db.contentAccess;
const Content = db.content;

exports.addVideo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  let video = [];
  try {
    req.files.forEach((file) => {
      if (file.mimetype.startsWith("video/")) {
        let obj = {
          url: file.path,
          private: 0,
        };
        video.push(obj);
      } else {
        return false;
      }
    });

    await Content.bulkCreate(video);
    if (video.length == 0) {
      return res.status(400).json({ msg: "please upload video only" });
    } else {
      return res.status(200).json({ MSG: "video uploaded sucessfully" });
    }
  } catch (e) {
    console.error(e);
    return res.status(400).json({ msg: "video not found" });
  }
};

exports.authenticate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let video = [];
  try {
    req.body.contents.forEach((content) => {
      let obj = {
        UserId: content.userId,
        ContentId: content.contentId,
      };
      video.push(obj);
    });

    await contentAccess.bulkCreate(video);
    video.forEach(async (content) => {
      const video = await Content.findOne({ where: { id: content.ContentId } });
      video.private = 1;
      return video.save();
    });
    return res.status(200).json({ msg: "video blocked sucessfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "something went wrong" });
  }
};

exports.getVideo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // const result = [];
  // try {
  //   const videos = await Content.findAll();
  //   for (const video of videos) {
  //     if (video.private === true) {
  //       const access = await contentAccess.findAll({
  //         where: { contentId: video.id },
  //       });
  //       access.forEach((auth) => {
  //         if (auth.userId == req.user.id) {
  //           result.push(video);
  //         }
  //       });
  //     };
  //     if (video.private === false) {
  //       result.push(video);
  //     }
  //   }
  //   return res.status(200).json({ videos: result });
  // }

  try {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 5;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    const UserId = req.user.id;
    const data = await Content.findAndCountAll({
      where: {
        [Op.or]: [
          { private: false },
          {
            private: true,
            UserId: Sequelize.col("Content_Accesses.UserId"),
            // '$Content_Accesses.UserId$': req.user.id,
          },
        ],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: contentAccess,
          attributes: [],
          where: {
            UserId: req.user.id,
          },
          required: false,
        },
      ],
    });
    return res.json({ data });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "something went wrong" });
  }
};
