import mongoose from "mongoose";
import Category from "./categoryModel.js";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    },
    subCategory: {
      type: String
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Paid", "Pending"],
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "Black Box"],
      required: function () {
        return this.paymentStatus === "Paid";
      },
      validate: {
        validator: function (value) {
          // If status is "Pending", paymentMode must be undefined/null/empty string
          if (this.paymentStatus === "Pending") {
            return value === undefined || value === null || value === "";
          }
          return true; // Otherwise, value must be valid per enum
        },
        message: "paymentMode must be empty when paymentStatus is Pending",
      },
    },
    remarks: String,
    billAttachment: String,
    paymentAttachment: String,
  },
  { timestamps: true }
);

// Remove the hardcoded virtual - categories will be fetched from database

export default mongoose.model("Expense", expenseSchema);
