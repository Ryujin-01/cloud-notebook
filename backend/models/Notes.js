const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user: {
    // type: mongoose.Schema.Types.ObjectId. This tells Mongoose: “the value stored in user will be an ObjectId, not just any random string or number.”
    // ref: "user". This tells Mongoose that the user ObjectId refers to a document inside the user collection (the collection created from your User model).
    // In other words, it creates a relationship between Notes and User.
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    unique: true,
  },
  tag: {
    type: String,
    default: "General",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("notes", NotesSchema);
