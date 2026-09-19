import Expense from "../Models/expenseModel.js";
import Category from "../Models/categoryModel.js";
import fs from "fs";
import path from "path";

export const createExpense = async (req, res) => {
  try {
    let billAttachment = null;
    let paymentAttachment = null;
    
    // Handle file uploads
    if (req.files) {
      if (req.files.billAttachment) {
        billAttachment = `/uploads/${req.files.billAttachment[0].filename}`;
      }
      if (req.files.paymentAttachment) {
        paymentAttachment = `/uploads/${req.files.paymentAttachment[0].filename}`;
      }
    }

    // Clean up paymentMode and paymentAttachment for pending status
    const expenseData = { ...req.body, billAttachment, paymentAttachment };
    if (expenseData.paymentStatus === "Pending") {
      expenseData.paymentMode = undefined;
      expenseData.paymentAttachment = null;
    }

    // Validate subcategory if provided
    if (expenseData.subCategory && expenseData.category) {
      const category = await Category.findOne({ name: expenseData.category });
      if (!category) {
        return res.status(400).json({
          error: `${expenseData.category} is not a valid category.`,
        });
      }
      
      if (!category.subCategories.includes(expenseData.subCategory)) {
        return res.status(400).json({
          error: `${expenseData.subCategory} is not a valid subcategory for the selected category.`,
        });
      }
    }

    const expense = new Expense(expenseData);
    await expense.save();
    res.status(201).json({ expense, message: "Expense created successfully" });
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getMonthlyExpense = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=7&year=2025)",
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    const total = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate,
          },
          // Only consider paid expenses
          category: { $ne: "Loans & Interests" },
          paymentStatus: "Paid", // Exclude Loans & Interests regardless of payment status
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({ monthlyExpense: total[0]?.totalAmount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLoansAndInterestsMonthlyTotals = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=6&year=2025)",
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    // Get all Loans & Interests (both Paid and Pending)
    const total = await Expense.aggregate([
      {
        $match: {
          category: "Loans & Interests",
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalLoansExpense = total.length > 0 ? total[0].totalAmount : 0;

    console.log(`📊 Loans & Interests - Month: ${monthInt}, Year: ${yearInt}, Total: ${totalLoansExpense}`);

    res.status(200).json({
      totalLoansExpense,
    });
  } catch (err) {
    console.error("Get Loans & Interests error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getExpensePieChartData = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=6&year=2025)",
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    // Get total expense for the month (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalResult[0]?.totalAmount || 0;

    // Get category-wise totals
    const expensePieChartData = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Add percentage to each category
    const formattedData = expensePieChartData.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage:
        totalAmount > 0
          ? ((item.totalAmount / totalAmount) * 100).toFixed(2)
          : "0",
    }));

    res.status(200).json({
      expensePieChartData: formattedData,
      totalMonthlyExpense: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getYearlyExpenseSummary = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({
        error: "Year is required (e.g. ?year=2025)",
      });
    }
    const yearInt = parseInt(year);
    if (isNaN(yearInt)) {
      return res.status(400).json({ error: "Invalid year" });
    }
    const startDate = new Date(yearInt, 0, 1); // Jan 1st
    const endDate = new Date(yearInt + 1, 0, 1); // Jan 1st next year

    // Total yearly expense (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalResult[0]?.totalAmount || 0;

    // Total yearly Loans & Interests (both Paid and Pending)
    const loansResult = await Expense.aggregate([
      {
        $match: {
          category: "Loans & Interests",
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalLoansExpense = loansResult[0]?.totalAmount || 0;
    console.log(`📊 Yearly Loans & Interests - Year: ${yearInt}, Total: ${totalLoansExpense}`);

    // Category-wise yearly totals (excluding Loans & Interests)
    const expensePieChartData = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lt: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const formattedData = expensePieChartData.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage:
        totalAmount > 0
          ? ((item.totalAmount / totalAmount) * 100).toFixed(2)
          : "0",
    }));

    res.status(200).json({
      totalYearlyExpense: totalAmount,
      totalLoansExpense,
      expensePieChartData: formattedData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyExpenseData = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required (e.g. ?month=7&year=2025)",
      });
    }
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);
    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    // Get current date to identify "latest" month/year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check if the selected month/year is the current (latest) month
    const isLatestMonth = (yearInt === currentYear && monthInt === currentMonth);

    let query;
    if (isLatestMonth) {
      // For the current month, include:
      // 1. All expenses (Paid or Pending) originally in this month
      // 2. All pending expenses from ANY other month (past or future)
      query = {
        $or: [
          { date: { $gte: startDate, $lt: endDate } },
          { paymentStatus: "Pending" }
        ]
      };
    } else {
      // For all other months (past or future), show ONLY Paid expenses
      // Pending expenses are "moved" to the latest month
      query = {
        date: { $gte: startDate, $lt: endDate },
        paymentStatus: "Paid"
      };
    }

    // Get all expenses based on the query
    const expensesRaw = await Expense.find(query).lean();

    // Transform expenses that are pending to show in the current month
    const expenses = expensesRaw.map(exp => {
      // If it's a pending expense, it should look and act as if it's in the latest month
      if (exp.paymentStatus === "Pending") {
        // Change date to the 1st of the selected (latest) month
        const newDate = new Date(yearInt, monthInt - 1, 1);
        
        // If it was originally from a different month, tag it
        const expDate = new Date(exp.date);
        const isFromDifferentMonth = expDate.getMonth() + 1 !== monthInt || expDate.getFullYear() !== yearInt;
        
        return { 
          ...exp, 
          date: newDate, 
          isCarryForward: isFromDifferentMonth,
          originalDate: exp.date 
        };
      }
      return exp;
    });

    console.log(`📊 MONTHLY EXPENSE DATA - Month: ${monthInt}, Year: ${yearInt}`);
    console.log(`Total items found: ${expenses.length} (Raw: ${expensesRaw.length})`);

    // Get unique categories
    const categories = [...new Set(expenses.map((exp) => exp.category))];

    res.status(200).json({
      categories,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Debug endpoint to check attachment data
export const debugAttachments = async (req, res) => {
  try {
    const expensesWithAttachments = await Expense.find({
      $or: [
        { billAttachment: { $exists: true, $ne: null, $ne: "" } },
        { paymentAttachment: { $exists: true, $ne: null, $ne: "" } }
      ]
    }).select('category amount billAttachment paymentAttachment date').limit(10);
    
    console.log('🔍 DEBUG ATTACHMENTS - Found expenses with attachments:', expensesWithAttachments.length);
    expensesWithAttachments.forEach((exp, index) => {
      console.log(`Expense ${index + 1}:`, {
        id: exp._id,
        category: exp.category,
        amount: exp.amount,
        billAttachment: exp.billAttachment,
        paymentAttachment: exp.paymentAttachment,
        date: exp.date
      });
    });
    
    res.status(200).json({
      totalWithAttachments: expensesWithAttachments.length,
      expenses: expensesWithAttachments
    });
  } catch (err) {
    console.error('Debug attachments error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getExpenseCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    
    // Transform to the expected format
    const categorySubMap = {};
    const categoryNames = [];
    
    categories.forEach(category => {
      categoryNames.push(category.name);
      categorySubMap[category.name] = category.subCategories || [];
    });

    res.status(200).json({ 
      categories: categoryNames, 
      categorySubMap 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating expense with ID:", id);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    let expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    let billAttachment = expense.billAttachment;
    let paymentAttachment = expense.paymentAttachment;
    
    // Handle file uploads
    if (req.files) {
      if (req.files.billAttachment) {
        // Remove old bill attachment if present
        if (expense.billAttachment) {
          const oldFilePath = path.resolve(
            "./uploads" + expense.billAttachment.replace("/uploads", "")
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        billAttachment = `/uploads/${req.files.billAttachment[0].filename}`;
      }
      if (req.files.paymentAttachment) {
        // Remove old payment attachment if present
        if (expense.paymentAttachment) {
          const oldFilePath = path.resolve(
            "./uploads" + expense.paymentAttachment.replace("/uploads", "")
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        paymentAttachment = `/uploads/${req.files.paymentAttachment[0].filename}`;
      }
    }

    // Update fields
    const updateData = { ...req.body, billAttachment, paymentAttachment };

    // Clean up paymentMode and paymentAttachment for pending status
    if (updateData.paymentStatus === "Pending") {
      updateData.paymentMode = undefined;
      updateData.paymentAttachment = undefined;
    }

    // Validate subcategory if provided
    if (updateData.subCategory && updateData.category) {
      const category = await Category.findOne({ name: updateData.category });
      if (!category) {
        return res.status(400).json({
          error: `${updateData.category} is not a valid category.`,
        });
      }
      
      if (!category.subCategories.includes(updateData.subCategory)) {
        return res.status(400).json({
          error: `${updateData.subCategory} is not a valid subcategory for the selected category.`,
        });
      }
    }

    // Ensure correct types for amount and date
    if (updateData.amount !== undefined)
      updateData.amount = Number(updateData.amount);
    if (updateData.date !== undefined)
      updateData.date = new Date(updateData.date);
    
    console.log("Update data:", updateData);
    expense = await Expense.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: false,
    });
    console.log("Updated expense:", expense);
    res.status(200).json({ expense, message: "Expense updated successfully" });
  } catch (err) {
    console.error("Update expense error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    // Remove file if present
    if (expense.fileUrl) {
      const filePath = path.resolve(
        "./uploads" + expense.fileUrl.replace("/uploads", "")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New date range filter functions
export const getDateRangeExpense = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get total expense for the date range (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalExpense = totalResult[0]?.totalAmount || 0;

    res.status(200).json({ totalExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangeLoansExpense = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get total Loans & Interests for the date range (both Paid and Pending)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: "Loans & Interests",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalLoansExpense = totalResult[0]?.totalAmount || 0;

    console.log(`📊 Date Range Loans & Interests - ${fromDate} to ${toDate}, Total: ${totalLoansExpense}`);

    res.status(200).json({ totalLoansExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangePieChartData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get total expense for the date range (excluding Loans & Interests)
    const totalResult = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalResult[0]?.totalAmount || 0;

    // Get category-wise totals for the date range
    const expensePieChartData = await Expense.aggregate([
      {
        $match: {
          category: { $ne: "Loans & Interests" },
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Add percentage to each category
    const formattedData = expensePieChartData.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage:
        totalAmount > 0
          ? ((item.totalAmount / totalAmount) * 100).toFixed(2)
          : "0",
    }));

    res.status(200).json({
      expensePieChartData: formattedData,
      totalExpense: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangeExpenseData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error:
          "fromDate and toDate are required (e.g. ?fromDate=2025-01-01&toDate=2025-01-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: "fromDate cannot be greater than toDate" });
    }

    // Get all expenses for the date range
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    console.log('📊 DATE RANGE EXPENSE DATA - Sample expense:', expenses.length > 0 ? {
      id: expenses[0]._id,
      category: expenses[0].category,
      amount: expenses[0].amount,
      billAttachment: expenses[0].billAttachment,
      paymentAttachment: expenses[0].paymentAttachment,
      hasAttachments: !!(expenses[0].billAttachment || expenses[0].paymentAttachment)
    } : 'No expenses found');

    // Get unique categories
    const categories = [...new Set(expenses.map((exp) => exp.category))];

    res.status(200).json({
      categories,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Debug endpoint to check all expenses in database
export const debugAllExpenses = async (req, res) => {
  try {
    const allExpenses = await Expense.find({});
    
    // Count by category
    const categoryCounts = {};
    allExpenses.forEach(exp => {
      categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1;
    });

    // Find loans expenses specifically
    const loansExpenses = await Expense.find({ category: "Loans & Interests" });
    
    console.log('🔍 DEBUG ALL EXPENSES:');
    console.log('Total expenses:', allExpenses.length);
    console.log('Categories:', categoryCounts);
    console.log('Loans & Interests count:', loansExpenses.length);
    if (loansExpenses.length > 0) {
      console.log('Sample Loans expense:', loansExpenses[0]);
    }

    res.status(200).json({
      totalExpenses: allExpenses.length,
      categoryCounts,
      loansCount: loansExpenses.length,
      loansExpenses: loansExpenses.slice(0, 5), // First 5 loans expenses
      allCategories: Object.keys(categoryCounts)
    });
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ error: err.message });
  }
};
