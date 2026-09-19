import Sales from "../Models/salesModel.js";
import Order from "../Models/orderModel.js";

// Get yearly combined sales + orders data
export const getYearlyCombinedSalesData = async (req, res) => {
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

    // Get sales data for the year
    const salesData = await Sales.aggregate([
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
          totalSales: { $sum: "$totalSales" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get orders data for the year
    const ordersData = await Order.aggregate([
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
          totalOrders: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const salesAmount = salesData[0] ? salesData[0].totalSales : 0;
    const ordersAmount = ordersData[0] ? ordersData[0].totalOrders : 0;
    const combinedTotal = salesAmount + ordersAmount;

    return res.status(200).json({
      totalYearlySales: combinedTotal,
      totalSalesOnly: salesAmount,
      totalOrdersOnly: ordersAmount,
      year: yearInt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
