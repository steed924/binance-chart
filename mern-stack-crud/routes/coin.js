var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Coin = require("../models/Coin.js");

router.get("/", function (req, res, next) {
  Coin.find(function (err, products) {
    if (err) return next(err);
    res.json(products);
  });
});

router.post("/", function (req, res, next) {
  Coin.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

router.delete("/:id", function (req, res, next) {
  Coin.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
