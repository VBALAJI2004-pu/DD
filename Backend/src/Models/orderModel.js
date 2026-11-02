import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: [
        "Cash",
        "Online",
        "UPI",
        "Bank Transfer",
        "Card",
        "Cheque",
        "Other",
        "",
      ],
    },
    remarks: String,
    fileUrl: String,
    paymentReceived: {
      type: String,
      enum: ["yes", "no", ""],
      default: "",
    },
    amountPaid: {
      type: Number,
      min: 0,
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

export default mongoose.model("Order", orderSchema);
