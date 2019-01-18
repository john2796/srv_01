const express = require("express");
const router = express.Router();
const passport = require("passport");

// model
const Insta = require("../../models/Insta");
const validateInstaProfileInput = require("../../validation/validateInstaProfileInput");
// @route   GET api/commentbox/comments
// @desc    get users
// @access  Public
//http://localhost:5000/api/insta
router.get("/", (req, res) => {
  const errors = {};
  Insta.find()
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "There is no profiles" }));
});

// @route   POST api/insta
// @desc    Post comments
// @access  Public
//http://localhost:5000/api/insta
router.post("/", (req, res) => {
  const profileFields = {};

  if (req.body.isLiked) profileFields.isLiked = req.body.isLiked;
  if (req.body.username) profileFields.username = req.body.username;
  if (req.body.thumbnailUrl) profileFields.thumbnailUrl = req.body.thumbnailUrl;
  if (req.body.imageUrl) profileFields.imageUrl = req.body.imageUrl;
  if (req.body.likes) profileFields.likes = req.body.likes;

  Insta.findOne({ username: req.body.username }, profiles => {
    if (profiles) {
      errors.username = "The username already exists";
      res.status(400).json(errors);
    }
    new Insta(profileFields).save().then(profiles => res.json(profiles));
  });
});

// @route   POST api/insta/comments
// @desc    Add comments
// @access  Public

router.post("/comments/:username", (req, res) => {
  Insta.findOne({ username: req.params.username }).then(profile => {
    const newComments = {
      text: req.body.text,
      username: req.body.username,
      commentId: req.body.commentId
    };
    profile.comments.push(newComments);
    profile
      .save()
      .then(profile => res.json(profile))
      .catch(err => console.log(err));
  });
});

// @route   Delete api/commentbox/comments
// @desc    Delete comments
// @access  Public
//http://localhost:5000/api/comments/:commentId
router.delete("/comments/:commentId/:username", (req, res) => {
  const commentId = req.params.commentId;
  Insta.findOne({ username: req.params.username }, (err, profile) => {
    if (err) res.status(401).json({ success: false });
    const postComments = profile.comments.filter(
      comment => comment.commentId !== commentId
    );
    profile.comments = postComments;

    profile.save().then(() => {
      Insta.find({}, (err, posts) => {
        if (err) return res.status(401).json({ success: false });
        res.json(posts);
      });
    });
  });
});

module.exports = router;
