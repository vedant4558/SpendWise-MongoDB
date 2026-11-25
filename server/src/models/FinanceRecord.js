import mongoose from "mongoose";

const financeRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  collection: { type: String, required: true, enum: ["transactions", "budgets", "goals", "recurring", "reminders"], index: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true, minimize: false });

financeRecordSchema.index({ user: 1, collection: 1, createdAt: -1 });
export default mongoose.model("FinanceRecord", financeRecordSchema);
