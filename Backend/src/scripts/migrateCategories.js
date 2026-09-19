import mongoose from "mongoose";
import Category from "../Models/categoryModel.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const defaultCategories = {
  "Thatha Materials": ["Tea & Coffee", "Cakes & Bakes", "Ice cream"],
  "Masala Materials": ["Cardamom", "Pepper", "Clove", "Masala 1", "Masala 2"],
  "Add ON Materials": [
    "Honey",
    "Jaggery Powder",
    "Chocolate Syrup",
    "Choco Chips",
    "Sprinkels",
    "Sauce",
  ],
  "Fresh Materials": ["Ginger", "Lemon", "Mint"],
  "Milk": ["Arokya", "Nandini"],
  "Gas": [],
  "Packing and Cleaning": [],
  "Food": [],
  "Fuel": [],
  "Bisleri Water Bottle": [],
  "Transport": [
    "Hot Snacks",
    "Nandini",
    "Arokya",
    "Thatha Materials",
    "Others - Remark",
  ],
  "Police": ["Car", "Bike", "Station"],
  "BBMP - Garbage": [],
  "Donation": [],
  "Coco Powder": [],
  "Water Can": [],
  "Staff Expenses": [
    "Room Rent",
    "Room E - Bill",
    "Room Water Tank",
    "Staff Food - Remark",
    "Others - Remark",
  ],
  "Shop Expenses": [
    "Shop Rent",
    "Shop E - Bill",
    "Shop Maintainace - Remark",
    "Wifi",
  ],
  "Legal Doc": [
    "Rental Agreement",
    "Trade License",
    "FSSAI License",
    "Labour License",
  ],
  "Loans & Interests": [
    "GOWTHAM EMI - 4939",
    "GOWTHAM EMI - 14711",
    "GOWTHAM EMI - 4023",
    "SRINIVAS EMI -14839",
    "SRINIVAS EMI - 4000",
    "GOWTHAM INTREST - 2400",
    "GOWTHAM GOLD INTREST - 20400",
    "1720",
  ],
};

async function migrateCategories() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check if categories already exist
    const existingCategories = await Category.find({});
    if (existingCategories.length > 0) {
      console.log(`Found ${existingCategories.length} existing categories. Skipping migration.`);
      return;
    }

    console.log("Migrating categories to database...");
    
    const categoryPromises = Object.entries(defaultCategories).map(([name, subCategories]) => {
      const category = new Category({
        name,
        subCategories
      });
      return category.save();
    });

    await Promise.all(categoryPromises);
    
    console.log(`Successfully migrated ${Object.keys(defaultCategories).length} categories to database`);
    
    // Verify migration
    const migratedCategories = await Category.find({});
    console.log("Migrated categories:");
    migratedCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.subCategories.length} subcategories)`);
    });

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCategories();
}

export default migrateCategories;
