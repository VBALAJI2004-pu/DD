import CustomInHand from "../Models/customInHandModel.js";

export const getCustomInHand = async (req, res) => {
  try {
    const userId = req.user.id;
    let inHandConfig = await CustomInHand.findOne({ userId });

    if (!inHandConfig) {
      inHandConfig = {
        userId,
        selectedCards: [],
      };
    }

    res.status(200).json({ inHandConfig });
  } catch (error) {
    console.error("Get custom in hand error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const saveCustomInHand = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedCards } = req.body;

    if (!selectedCards || !Array.isArray(selectedCards) || selectedCards.length === 0) {
      return res.status(400).json({
        error: "selectedCards must be a non-empty array",
      });
    }

    // Validate all selected cards have required fields
    const invalidCards = selectedCards.some(
      (card) => !card.cardId || !card.cardName || !card.operator
    );
    if (invalidCards) {
      return res.status(400).json({
        error: "All selected cards must have cardId, cardName, and operator",
      });
    }

    let inHandConfig = await CustomInHand.findOne({ userId });

    if (inHandConfig) {
      inHandConfig.selectedCards = selectedCards;
      inHandConfig.updatedAt = new Date();
      await inHandConfig.save();
    } else {
      inHandConfig = new CustomInHand({
        userId,
        selectedCards,
      });
      await inHandConfig.save();
    }

    res.status(201).json({
      message: "Custom in hand configuration saved successfully",
      inHandConfig,
    });
  } catch (error) {
    console.error("Save custom in hand error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomInHand = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedCards } = req.body;

    if (!selectedCards || !Array.isArray(selectedCards) || selectedCards.length === 0) {
      return res.status(400).json({
        error: "selectedCards must be a non-empty array",
      });
    }

    // Validate all selected cards have required fields
    const invalidCards = selectedCards.some(
      (card) => !card.cardId || !card.cardName || !card.operator
    );
    if (invalidCards) {
      return res.status(400).json({
        error: "All selected cards must have cardId, cardName, and operator",
      });
    }

    let inHandConfig = await CustomInHand.findOne({ userId });

    if (!inHandConfig) {
      inHandConfig = new CustomInHand({
        userId,
        selectedCards,
      });
    } else {
      inHandConfig.selectedCards = selectedCards;
      inHandConfig.updatedAt = new Date();
    }

    await inHandConfig.save();

    res.status(200).json({
      message: "Custom in hand configuration updated successfully",
      inHandConfig,
    });
  } catch (error) {
    console.error("Update custom in hand error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomInHand = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await CustomInHand.findOneAndDelete({ userId });

    if (!result) {
      return res.status(404).json({ error: "Custom in hand not found" });
    }

    res.status(200).json({
      message: "Custom in hand configuration deleted successfully",
    });
  } catch (error) {
    console.error("Delete custom in hand error:", error);
    res.status(500).json({ error: error.message });
  }
};
