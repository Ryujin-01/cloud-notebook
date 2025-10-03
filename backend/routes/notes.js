// Import all the required files
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");

// ROUTE 1: Fetching all notes of the user using GET: "/api/notes/fetchallnotes". Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error, "Bad Response");
    res.send(error);
  }
});

// ROUTE 2: Adding a new note using POST: "/api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req); // Taking errors.

    // If errors are present, displaying errors.
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;
    try {
      const note = new Notes({
        // Creating a new note. new Notes({...}) creates a new document object in memory (not yet saved to the database).
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save(); // Saving the new note. .save() tells Mongoose: “Take this document and insert it into MongoDB.”
      res.json({ savedNote });
    } catch (error) {
      console.error(error, "Bad Response");
      res.send(error);
    }
  }
);

// ROUTE 3: Updating a new note using PUT: "/api/notes/updatenote". Login required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create the new note
    let newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      9;
      newNote.tag = tag;
    }

    // Find the note to be updated and update it.
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ newNote });
  } catch (error) {
    console.error(error, "Bad Response");
    res.send(error);
  }
});

// ROUTE 4: Deleting a new note using DELETE: "/api/notes/deletenote". Login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // Find the note to be deleted and delete it.
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // Allow deletion only if user owns the note.
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error, "Bad Response");
    res.send(error);
  }
});

module.exports = router;
