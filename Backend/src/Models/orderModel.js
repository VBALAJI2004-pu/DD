import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderDate: {
      type: Date,
      required: true,
    },
    deliveryDate: {
      type: Date,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ["Cash", "Online"],
    },
    remarks: String,
    fileUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
