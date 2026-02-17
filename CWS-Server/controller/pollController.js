const Poll = require("../models/PollSchema.js");
exports.createPoll = async (req, res) => {
  if (!req.body.question || !req.body.options || req.body.options.length < 2) {
  return res.status(400).json({
    message: "Question and at least 2 options are required"
  });
}
  try {
    
    await Poll.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );
    // 2️⃣ Create new active poll
    const poll = new Poll({
  question: req.body.question,
  description: req.body.description,  
  options: req.body.options,
  isActive: true
});
    await poll.save();

    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ACTIVE POLL
exports.getActivePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ isActive: true });

    console.log("Active Poll From DB →", poll); // ✅ ADD THIS

    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PREVIOUS POLLS
exports.getPreviousPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ isActive: false })
      .sort({ createdAt: -1 });

    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VOTE
exports.votePoll = async (req, res) => {
  try {
    const { pollId, optionIndex, userId } = req.body;

    if (!pollId || optionIndex === undefined || !userId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isActive) {
      return res.status(400).json({ message: "Poll not active" });
    }
const alreadyVoted = poll.votedUsers.some(
  v => v.userId.toString() === userId.toString()
);

if (alreadyVoted) {
  return res.status(400).json({ message: "Already voted" });
}

if (optionIndex < 0 || optionIndex >= poll.options.length) {
  return res.status(400).json({ message: "Invalid option" });
}

poll.options[optionIndex].votes += 1;

poll.votedUsers.push({
  userId,
  optionIndex
  });
    const savedPoll = await poll.save();
    res.status(200).json(savedPoll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};