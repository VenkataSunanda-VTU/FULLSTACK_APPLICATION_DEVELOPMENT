const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all events
router.get("/", (req, res) => {
  db.query("SELECT * FROM events ORDER BY event_date DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create event
router.post("/", (req, res) => {
  const { title, description, event_date, location, seats } = req.body;
  db.query(
    "INSERT INTO events (title, description, event_date, location) VALUES (?, ?, ?, ?)",
    [title, description, event_date, location],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    }
  );
});

// Update event
router.put("/:id", (req, res) => {
  const { title, description, event_date, location } = req.body;
  db.query(
    "UPDATE events SET title=?, description=?, event_date=?, location=? WHERE id=?",
    [title, description, event_date, location, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Delete event
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM events WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;