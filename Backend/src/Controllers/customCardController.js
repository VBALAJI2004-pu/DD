import CustomCard from "../Models/customCardModel.js";

export const getCustomCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await CustomCard.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ cards });
  } catch (error) {
    console.error("Get custom cards error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createCustomCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, items } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        error: "Card name is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Card must have at least one item",
      });
    }

    // Validate all items have required fields
    const invalidItems = items.some(
      (item) => !item.category || !item.operator
    );
    if (invalidItems) {
      return res.status(400).json({
        error: "All items must have category and operator",
      });
    }

    const card = new CustomCard({
      userId,
      name: name.trim(),
      items,
    });

    await card.save();
    res.status(201).json({
      message: "Custom card created successfully",
      card,
    });
  } catch (error) {
    console.error("Create custom card error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { name, items } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        error: "Card name is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Card must have at least one item",
      });
    }

    // Validate all items have required fields
    const invalidItems = items.some(
      (item) => !item.category || !item.operator
    );
    if (invalidItems) {
      return res.status(400).json({
        error: "All items must have category and operator",
      });
    }

    const card = await CustomCard.findOne({ _id: cardId, userId });

    if (!card) {
      return res.status(404).json({ error: "Custom card not found" });
    }

    card.name = name.trim();
    card.items = items;
    card.updatedAt = new Date();

    await card.save();
    res.status(200).json({
      message: "Custom card updated successfully",
      card,
    });
  } catch (error) {
    console.error("Update custom card error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const card = await CustomCard.findOneAndDelete({
      _id: cardId,
      userId,
    });

    if (!card) {
      return res.status(404).json({ error: "Custom card not found" });
    }

    res.status(200).json({
      message: "Custom card deleted successfully",
    });
  } catch (error) {
    console.error("Delete custom card error:", error);
    res.status(500).json({ error: error.message });
  }
};
