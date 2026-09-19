import Order from "../Models/orderModel.js";
import fs from "fs";
import path from "path";

export const createOrder = async (req, res) => {
  try {
    let fileUrl = req.body.fileUrl;
    if (req.file) {
      // File uploaded, set fileUrl to public path
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const order = new Order({ ...req.body, fileUrl });
    await order.save();
    res.status(201).json({ order, message: "Order created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Yearly summary for orders (total amount and count)
export const getYearlyOrdersSummary = async (req, res) => {
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

    const totalResult = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const result = totalResult[0] || { totalAmount: 0, totalOrders: 0 };
    return res.status(200).json({
      totalYearlyOrdersAmount: result.totalAmount,
      totalYearlyOrdersCount: result.totalOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total orders amount for monthly period
export const getMonthlyOrdersTotal = async (req, res) => {
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

    const totalResult = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const result = totalResult[0] || { totalAmount: 0, totalOrders: 0 };
    return res.status(200).json({
      totalOrdersAmount: result.totalAmount,
      totalOrdersCount: result.totalOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total orders amount for yearly period
export const getYearlyOrdersTotal = async (req, res) => {
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

    const totalResult = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const result = totalResult[0] || { totalAmount: 0, totalOrders: 0 };
    return res.status(200).json({
      totalOrdersAmount: result.totalAmount,
      totalOrdersCount: result.totalOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total orders amount for date range
export const getDateRangeOrdersTotal = async (req, res) => {
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

    const totalResult = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const result = totalResult[0] || { totalAmount: 0, totalOrders: 0 };
    return res.status(200).json({
      totalOrdersAmount: result.totalAmount,
      totalOrdersCount: result.totalOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyOrders = async (req, res) => {
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

    const total = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const result = total[0] || { totalAmount: 0, totalOrders: 0 };
    res.status(200).json({ monthlyOrders: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyOrderData = async (req, res) => {
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

    // Get all orders for the month
    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
    }).lean();

    res.status(200).json({
      orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Yearly orders list for "All months" view
export const getYearlyOrderData = async (req, res) => {
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

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
    }).lean();

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating order with ID:", id);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    let order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    let fileUrl = order.fileUrl;
    // If a new file is uploaded, replace the old one
    if (req.file) {
      // Remove old file if present
      if (order.fileUrl) {
        const oldFilePath = path.resolve(
          "./uploads" + order.fileUrl.replace("/uploads", "")
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
    if (updateData.amount !== undefined)
      updateData.amount = Number(updateData.amount);
    if (updateData.orderDate !== undefined)
      updateData.orderDate = new Date(updateData.orderDate);
    if (updateData.deliveryDate !== undefined)
      updateData.deliveryDate = new Date(updateData.deliveryDate);
    // Remove fileUrl if not present in update
    if (!fileUrl) delete updateData.fileUrl;
    console.log("Update data:", updateData);
    order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log("Updated order:", order);
    res.status(200).json({ order, message: "Order updated successfully" });
  } catch (err) {
    console.error("Update order error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // Remove file if present
    if (order.fileUrl) {
      const filePath = path.resolve(
        "./uploads" + order.fileUrl.replace("/uploads", "")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await Order.findByIdAndDelete(id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Date range filter functions
export const getDateRangeOrders = async (req, res) => {
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

    // Get total orders for the date range
    const totalResult = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const result = totalResult[0] || { totalAmount: 0, totalOrders: 0 };

    res.status(200).json({ totalOrders: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDateRangeOrderData = async (req, res) => {
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

    // Get all orders for the date range
    const orders = await Order.find({
      orderDate: { $gte: startDate, $lte: endDate },
    }).lean();

    res.status(200).json({
      orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
