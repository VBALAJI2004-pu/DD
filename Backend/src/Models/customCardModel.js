import mongoose from "mongoose";

const customCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    items: [{
      category: {
        type: String,
        required: true
      },
      operator: {
        type: String,
        enum: ["+", "-"],
        default: "+"
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("CustomCard", customCardSchema);
