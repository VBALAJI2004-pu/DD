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
    orderDate: {
      type: Date,
    },
    orderId: {
      type: String,
    },
    orderAmount: {
      type: Number,
      min: 0,
    },
    paymentReceived: {
      type: String,
      enum: ["yes", "no", ""],
      default: "",
    },
    amountPaid: {
      type: Number,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other", "Online", ""],
    },
    paymentReceipt: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["none", "partial", "full", "unknown", ""],
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sales", salesSchema);
