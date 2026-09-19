import Sales from "../Models/salesModel.js";
import fs from "fs";
import path from "path";

export const createSales = async (req, res) => {
  try {
    let fileUrl = req.body.fileUrl;
    if (req.file) {
      // File uploaded, set fileUrl to public path
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const sales = new Sales({ ...req.body, fileUrl });
    await sales.save();
    res.status(201).json({ sales, message: "Sales created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMonthlySales = async (req, res) => {
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

    const total = await Sales.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
          totalSales: { $sum: { $add: ["$onlineCash", "$physicalCash"] } },
        },
      },
    ]);

    const result = total[0] || {
      totalOnlineCash: 0,
      totalPhysicalCash: 0,
      totalSales: 0,
    };
    res.status(200).json({ monthlySales: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSalesPieChartData = async (req, res) => {
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

    // Get total sales for the month
    const totalResult = await Sales.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
        },
      },
    ]);

    const result = totalResult[0] || {
      totalOnlineCash: 0,
      totalPhysicalCash: 0,
    };
    const totalAmount = result.totalOnlineCash + result.totalPhysicalCash;

    // Create pie chart data
    const salesPieChartData = [
      {
        category: "Online Cash",
        totalAmount: result.totalOnlineCash,
        percentage:
          totalAmount > 0
            ? ((result.totalOnlineCash / totalAmount) * 100).toFixed(2)
            : "0",
      },
      {
        category: "Physical Cash",
        totalAmount: result.totalPhysicalCash,
        percentage:
          totalAmount > 0
            ? ((result.totalPhysicalCash / totalAmount) * 100).toFixed(2)
            : "0",
      },
    ];

    res.status(200).json({
      salesPieChartData,
      totalMonthlySales: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getYearlySalesSummary = async (req, res) => {
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

    // Total yearly sales
    const totalResult = await Sales.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
        },
      },
    ]);

    const result = totalResult[0] || {
      totalOnlineCash: 0,
      totalPhysicalCash: 0,
    };
    const totalAmount = result.totalOnlineCash + result.totalPhysicalCash;

    // Create pie chart data
    const salesPieChartData = [
      {
        category: "Online Cash",
        totalAmount: result.totalOnlineCash,
        percentage:
          totalAmount > 0
            ? ((result.totalOnlineCash / totalAmount) * 100).toFixed(2)
            : "0",
      },
      {
        category: "Physical Cash",
        totalAmount: result.totalPhysicalCash,
        percentage:
          totalAmount > 0
            ? ((result.totalPhysicalCash / totalAmount) * 100).toFixed(2)
            : "0",
      },
    ];

    res.status(200).json({
      totalYearlySales: totalAmount,
      salesPieChartData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlySalesData = async (req, res) => {
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

    // Get all sales for the month
    const sales = await Sales.find({
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    res.status(200).json({
      sales,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Yearly sales list for "All months" view
export const getYearlySalesData = async (req, res) => {
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

    const startDate = new Date(yearInt, 0, 1);
    const endDate = new Date(yearInt + 1, 0, 1);

    const sales = await Sales.find({
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });

    return res.status(200).json({ sales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total sales amount for monthly period
export const getMonthlySalesTotal = async (req, res) => {
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

    const totalResult = await Sales.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
          totalSalesAmount: { $sum: { $add: ["$onlineCash", "$physicalCash"] } },
        },
      },
    ]);

    const result = totalResult[0] || { 
      totalOnlineCash: 0, 
      totalPhysicalCash: 0, 
      totalSalesAmount: 0 
    };
    
    return res.status(200).json({
      totalSalesAmount: result.totalSalesAmount,
      totalOnlineCash: result.totalOnlineCash,
      totalPhysicalCash: result.totalPhysicalCash,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSales = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating sales with ID:", id);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    let sales = await Sales.findById(id);
    if (!sales) {
      return res.status(404).json({ error: "Sales not found" });
    }
    let fileUrl = sales.fileUrl;
    // If a new file is uploaded, replace the old one
    if (req.file) {
      // Remove old file if present
      if (sales.fileUrl) {
        const oldFilePath = path.resolve(
          "./uploads" + sales.fileUrl.replace("/uploads", "")
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      fileUrl = `/uploads/${req.file.filename}`;
    }
    // Update fields
    const updateData = { ...req.body, fileUrl };

    // Ensure correct types for amount and date
    if (updateData.openingCash !== undefined)
      updateData.openingCash = Number(updateData.openingCash);
    if (updateData.purchaseCash !== undefined)
      updateData.purchaseCash = Number(updateData.purchaseCash);
    if (updateData.onlineCash !== undefined)
      updateData.onlineCash = Number(updateData.onlineCash);
    if (updateData.physicalCash !== undefined)
      updateData.physicalCash = Number(updateData.physicalCash);
    if (updateData.cashTransferred !== undefined)
      updateData.cashTransferred = Number(updateData.cashTransferred);
    if (updateData.closingCash !== undefined)
      updateData.closingCash = Number(updateData.closingCash);
    if (updateData.totalSales !== undefined)
      updateData.totalSales = Number(updateData.totalSales);
    if (updateData.date !== undefined)
      updateData.date = new Date(updateData.date);
    // Remove fileUrl if not present in update
    if (!fileUrl) delete updateData.fileUrl;
    console.log("Update data:", updateData);
    sales = await Sales.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log("Updated sales:", sales);
    res.status(200).json({ sales, message: "Sales updated successfully" });
  } catch (err) {
    console.error("Update sales error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteSales = async (req, res) => {
  try {
    const { id } = req.params;
    const sales = await Sales.findById(id);
    if (!sales) {
      return res.status(404).json({ error: "Sales not found" });
    }
    // Remove file if present
    if (sales.fileUrl) {
      const filePath = path.resolve(
        "./uploads" + sales.fileUrl.replace("/uploads", "")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await Sales.findByIdAndDelete(id);
    res.status(200).json({ message: "Sales deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Date range filter functions
export const getDateRangeSales = async (req, res) => {
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

    // Get total sales for the date range
    const totalResult = await Sales.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
        },
      },
    ]);

    const result = totalResult[0] || {
      totalOnlineCash: 0,
      totalPhysicalCash: 0,
    };
    const totalSales = result.totalOnlineCash + result.totalPhysicalCash;

    res.status(200).json({ totalSales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangeSalesPieChartData = async (req, res) => {
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

    // Get total sales for the date range
    const totalResult = await Sales.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
        },
      },
    ]);

    const result = totalResult[0] || {
      totalOnlineCash: 0,
      totalPhysicalCash: 0,
    };
    const totalAmount = result.totalOnlineCash + result.totalPhysicalCash;

    // Create pie chart data
    const salesPieChartData = [
      {
        category: "Online Cash",
        totalAmount: result.totalOnlineCash,
        percentage:
          totalAmount > 0
            ? ((result.totalOnlineCash / totalAmount) * 100).toFixed(2)
            : "0",
      },
      {
        category: "Physical Cash",
        totalAmount: result.totalPhysicalCash,
        percentage:
          totalAmount > 0
            ? ((result.totalPhysicalCash / totalAmount) * 100).toFixed(2)
            : "0",
      },
    ];

    res.status(200).json({
      salesPieChartData,
      totalSales: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangeSalesData = async (req, res) => {
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

    // Get all sales for the date range
    const sales = await Sales.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    res.status(200).json({
      sales,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total sales amount for yearly period
export const getYearlySalesTotal = async (req, res) => {
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

    const startDate = new Date(yearInt, 0, 1);
    const endDate = new Date(yearInt + 1, 0, 1);

    const totalResult = await Sales.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
          totalSalesAmount: { $sum: { $add: ["$onlineCash", "$physicalCash"] } },
        },
      },
    ]);

    const result = totalResult[0] || { 
      totalOnlineCash: 0, 
      totalPhysicalCash: 0, 
      totalSalesAmount: 0 
    };
    
    return res.status(200).json({
      totalSalesAmount: result.totalSalesAmount,
      totalOnlineCash: result.totalOnlineCash,
      totalPhysicalCash: result.totalPhysicalCash,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total sales amount for date range
export const getDateRangeSalesTotal = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    if (!fromDate || !toDate) {
      return res.status(400).json({
        error: "fromDate and toDate are required (e.g. ?fromDate=2025-07-01&toDate=2025-07-31)",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const totalResult = await Sales.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOnlineCash: { $sum: "$onlineCash" },
          totalPhysicalCash: { $sum: "$physicalCash" },
          totalSalesAmount: { $sum: { $add: ["$onlineCash", "$physicalCash"] } },
        },
      },
    ]);

    const result = totalResult[0] || { 
      totalOnlineCash: 0, 
      totalPhysicalCash: 0, 
      totalSalesAmount: 0 
    };
    
    return res.status(200).json({
      totalSalesAmount: result.totalSalesAmount,
      totalOnlineCash: result.totalOnlineCash,
      totalPhysicalCash: result.totalPhysicalCash,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
