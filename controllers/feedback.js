const Feedback = require('../models/feedback');

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).populate('user', 'username').populate('product', 'name');
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedbacks' });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('user', 'username').populate('product', 'name');
    if (feedback) {
      res.status(200).json(feedback);
    } else {
      res.status(404).json({ error: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedback' });
  }
};

const createFeedback = async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ error: 'Error creating feedback' });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (updatedFeedback) {
      res.status(200).json(updatedFeedback);
    } else {
      res.status(404).json({ error: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating feedback' });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndRemove(req.params.id);
    if (deletedFeedback) {
      res.status(200).json({ message: 'Feedback deleted successfully' });
    } else {
      res.status(404).json({ error: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting feedback' });
  }
};

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback
};
