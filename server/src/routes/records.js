
import { Router } from "express";
import mongoose from "mongoose";
import FinanceRecord from "../models/FinanceRecord.js";
import auth from "../middleware/auth.js";

const router = Router();

const allowed = [
  "transactions",
  "budgets",
  "goals",
  "recurring",
  "reminders"
];

router.use(auth);

// GET: Fetch all records of a particular collection
router.get("/:collection", async (req, res, next) => {
  try {
    const { collection } = req.params;

    if (!allowed.includes(collection)) {
      return res.status(404).json({
        message: "Record type not found."
      });
    }

    const rows = await FinanceRecord.find({
      user: req.userId,
      collection
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      rows.map((row) => ({
        ...row.payload,
        _id: row._id.toString()
      }))
    );
  } catch (error) {
    next(error);
  }
});

// POST: Create a new record
router.post("/:collection", async (req, res, next) => {
  try {
    const { collection } = req.params;

    if (!allowed.includes(collection)) {
      return res.status(404).json({
        message: "Record type not found."
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Invalid record data."
      });
    }

    const { _id, ...payload } = req.body;

    const row = await FinanceRecord.create({
      user: req.userId,
      collection,
      payload
    });

    res.status(201).json({
      ...payload,
      _id: row._id.toString()
    });
  } catch (error) {
    next(error);
  }
});

//PUT: Update only the supplied fields without erasing existing data
router.put("/:collection/:id", async (req, res, next) => {
  try {
    const { collection, id } = req.params;

    if (
      !allowed.includes(collection) ||
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(404).json({
        message: "Record not found."
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Invalid update data."
      });
    }

    const { _id, ...updates } = req.body;

    const row = await FinanceRecord.findOne({
      _id: id,
      user: req.userId,
      collection
    });

    if (!row) {
      return res.status(404).json({
        message: "Record not found."
      });
    }

    // Merge new values with the existing payload.
    row.payload = {
      ...(row.payload || {}),
      ...updates
    };

    row.markModified("payload");

    await row.save();

    res.json({
      ...row.payload,
      _id: row._id.toString()
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete a record
router.delete("/:collection/:id", async (req, res, next) => {
  try {
    const { collection, id } = req.params;

    if (
      !allowed.includes(collection) ||
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(404).json({
        message: "Record not found."
      });
    }

    const row = await FinanceRecord.findOneAndDelete({
      _id: id,
      user: req.userId,
      collection
    });

    if (!row) {
      return res.status(404).json({
        message: "Record not found."
      });
    }

    res.json({
      message: "Deleted successfully."
    });
  } catch (error) {
    next(error);
  }
});

export default router;
