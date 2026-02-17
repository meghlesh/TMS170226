const express = require("express");
const router = express.Router();

const {
  createPoll,
  getActivePoll,
  getPreviousPolls,
  votePoll
} = require("../controller/pollController");


router.post("/create", createPoll);  
router.get("/active", getActivePoll);
router.get("/previous", getPreviousPolls);
router.post("/vote", votePoll);

module.exports = router;