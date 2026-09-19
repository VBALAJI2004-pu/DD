import Category from "../Models/categoryModel.js";

// Get all categories with subcategories
export const getCategories = async (req, res) => {
  try {
    console.log('🔍 getCategories called');
    const categories = await Category.find({});
    
    // Transform to the expected format
    const categorySubMap = {};
    categories.forEach(category => {
      categorySubMap[category.name] = category.subCategories || [];
    });

    res.status(200).json({
      categories: categories.map(cat => cat.name),
      categorySubMap
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Add new category
export const addCategory = async (req, res) => {
  try {
    console.log('➕ addCategory called with body:', req.body);
    const { categoryName } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory = new Category({
      name: categoryName.trim(),
      subCategories: []
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Failed to add category" });
  }
};

// Update category name
export const updateCategory = async (req, res) => {
  try {
    console.log('✏️ updateCategory called with params:', req.params, 'body:', req.body);
    const { categoryName } = req.params;
    const { newCategoryName } = req.body;

    if (!newCategoryName || !newCategoryName.trim()) {
      return res.status(400).json({ error: "New category name is required" });
    }

    // Check if new name already exists (and it's different from current)
    if (categoryName !== newCategoryName) {
      const existingCategory = await Category.findOne({ name: newCategoryName });
      if (existingCategory) {
        return res.status(400).json({ error: "Category name already exists" });
      }
    }

    const category = await Category.findOneAndUpdate(
      { name: categoryName },
      { name: newCategoryName.trim() },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    console.log('🗑️ deleteCategory called with params:', req.params);
    const { categoryName } = req.params;

    const category = await Category.findOneAndDelete({ name: categoryName });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

// Add subcategory
export const addSubCategory = async (req, res) => {
  try {
    console.log('➕ addSubCategory called with body:', req.body);
    const { categoryName, subCategoryName } = req.body;

    if (!categoryName || !subCategoryName || !subCategoryName.trim()) {
      return res.status(400).json({ error: "Category name and subcategory name are required" });
    }

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if subcategory already exists
    if (category.subCategories.includes(subCategoryName.trim())) {
      return res.status(400).json({ error: "Subcategory already exists" });
    }

    category.subCategories.push(subCategoryName.trim());
    await category.save();

    res.status(201).json({
      message: "Subcategory added successfully",
      category
    });
  } catch (error) {
    console.error("Error adding subcategory:", error);
    res.status(500).json({ error: "Failed to add subcategory" });
  }
};

// Update subcategory
export const updateSubCategory = async (req, res) => {
  try {
    console.log('✏️ updateSubCategory called with params:', req.params, 'body:', req.body);
    const { categoryName, subCategoryName } = req.params;
    const { newSubCategoryName } = req.body;

    if (!newSubCategoryName || !newSubCategoryName.trim()) {
      return res.status(400).json({ error: "New subcategory name is required" });
    }

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const subIndex = category.subCategories.indexOf(subCategoryName);
    if (subIndex === -1) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    // Check if new subcategory name already exists (and it's different from current)
    if (subCategoryName !== newSubCategoryName && category.subCategories.includes(newSubCategoryName.trim())) {
      return res.status(400).json({ error: "Subcategory name already exists" });
    }

    category.subCategories[subIndex] = newSubCategoryName.trim();
    await category.save();

    res.status(200).json({
      message: "Subcategory updated successfully",
      category
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ error: "Failed to update subcategory" });
  }
};

// Get subcategories for a specific category
export const getSubCategories = async (req, res) => {
  try {
    console.log('📋 getSubCategories called with params:', req.params);
    const { categoryName } = req.params;

    if (categoryName) {
      // Get subcategories for a specific category
      const category = await Category.findOne({ name: categoryName });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.status(200).json({
        subcategories: category.subCategories || []
      });
    } else {
      // Get all subcategories from all categories
      const categories = await Category.find({});
      const allSubCategories = {};
      
      categories.forEach(category => {
        allSubCategories[category.name] = category.subCategories || [];
      });

      res.status(200).json({
        subcategories: allSubCategories
      });
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
};

// Delete subcategory
export const deleteSubCategory = async (req, res) => {
  try {
    console.log('🗑️ deleteSubCategory called with params:', req.params);
    const { categoryName, subCategoryName } = req.params;

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const subIndex = category.subCategories.indexOf(subCategoryName);
    if (subIndex === -1) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    category.subCategories.splice(subIndex, 1);
    await category.save();

    res.status(200).json({
      message: "Subcategory deleted successfully",
      category
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
};
