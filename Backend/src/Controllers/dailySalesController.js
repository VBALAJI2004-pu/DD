import Sales from "../Models/salesModel.js";
import Order from "../Models/orderModel.js";

// Get daily sales + orders data for a specific month
export const getDailySalesData = async (req, res) => {
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
    const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

    // Get sales data grouped by day
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
          _id: { $dayOfMonth: "$date" },
          totalSales: { $sum: "$totalSales" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    // Get orders data grouped by day
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
          _id: { $dayOfMonth: "$orderDate" },
          totalOrders: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    // Create array for all days of the month (1 to 30/31) combining sales and orders
    const dailySalesArray = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const salesDayData = salesData.find(item => item._id === day);
      const ordersDayData = ordersData.find(item => item._id === day);
      
      const salesAmount = salesDayData ? salesDayData.totalSales : 0;
      const ordersAmount = ordersDayData ? ordersDayData.totalOrders : 0;
      const combinedAmount = salesAmount + ordersAmount;
      
      dailySalesArray.push({
        x: day.toString(),
        y: combinedAmount,
        salesAmount: salesAmount,
        ordersAmount: ordersAmount,
        salesCount: salesDayData ? salesDayData.count : 0,
        ordersCount: ordersDayData ? ordersDayData.count : 0,
      });
    }

    // Calculate total combined sales + orders for the month
    const totalMonthlySales = dailySalesArray.reduce((sum, day) => sum + day.y, 0);
    const totalSalesOnly = dailySalesArray.reduce((sum, day) => sum + day.salesAmount, 0);
    const totalOrdersOnly = dailySalesArray.reduce((sum, day) => sum + day.ordersAmount, 0);

    return res.status(200).json({
      dailySales: dailySalesArray,
      totalMonthlySales, // Combined total
      totalSalesOnly,
      totalOrdersOnly,
      daysInMonth,
      month: monthInt,
      year: yearInt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
