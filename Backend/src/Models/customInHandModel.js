import mongoose from "mongoose";

const customInHandSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectedCards: [
      {
        cardId: {
          type: String,
          required: true,
        },
        cardName: {
          type: String,
          required: true,
        },
        operator: {
          type: String,
          enum: ["+", "-"],
          default: "+",
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CustomInHand", customInHandSchema);
