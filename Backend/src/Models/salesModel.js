import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    openingCash: {
      type: Number,
      required: true,
    },
    purchaseCash: {
      type: Number,
      required: true,
    },
    onlineCash: {
      type: Number,
      required: true,
    },
    physicalCash: {
      type: Number,
      required: true,
    },
    cashTransferred: {
      type: Number,
      default: 0,
    },
    closingCash: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    remarks: String,
    fileUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Sales", salesSchema);
