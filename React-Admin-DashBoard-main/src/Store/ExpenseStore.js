import { create } from "zustand";
import axiosInstance from "../Library/Axios";
import { toast } from "react-toastify";
const getInitialMonth = () => {
  const saved = localStorage.getItem("selectedMonth");
  if (saved) return Number(saved);
  return new Date().getMonth() + 1; // JS months are 0-based
};

const getInitialYear = () => {
  const saved = localStorage.getItem("selectedYear");
  if (saved) return Number(saved);
  return new Date().getFullYear();
};

const useExpenseStore = create((set, get) => ({
  loading: false,
  error: null,
  monthlyExpense: 0,
  totalLoansExpense: null,
  expensePieChartData: [],
  yearlyExpenseSummary: {
    totalYearlyExpense: 0,
    totalLoansExpense: 0,
    expensePieChartData: [],
    expenses: [],
    categories: [],
  }, // safe defaults to prevent undefined in UI
  monthlyExpenseData: { categories: [], expenses: [] },
  categories: [],
  categorySubMap: {},
  selectedMonth: getInitialMonth(),
  selectedYear: getInitialYear(),
  // Date range filter state
  fromDate: localStorage.getItem("fromDate") || "",
  toDate: localStorage.getItem("toDate") || "",
  isDateRangeActive: localStorage.getItem("isDateRangeActive") === "true",
  // Data refresh trigger for real-time updates
  dataRefreshTrigger: 0,
  triggerDataRefresh: () => {
    set((state) => ({ dataRefreshTrigger: state.dataRefreshTrigger + 1 }));
  },
  setFromDate: (date) => {
    localStorage.setItem("fromDate", date);
    set({ fromDate: date });
    const toDate = localStorage.getItem("toDate");
    // Clear month/year data when date range is active
    if (date && toDate) {
      localStorage.setItem("isDateRangeActive", "true");
      set({ isDateRangeActive: true });
      // Trigger data refresh after a small delay to ensure state is updated
      setTimeout(() => get().triggerDataRefresh(), 100);
    }
  },
  setToDate: (date) => {
    localStorage.setItem("toDate", date);
    set({ toDate: date });
    const fromDate = localStorage.getItem("fromDate");
    // Clear month/year data when date range is active
    if (date && fromDate) {
      localStorage.setItem("isDateRangeActive", "true");
      set({ isDateRangeActive: true });
      // Trigger data refresh after a small delay to ensure state is updated
      setTimeout(() => get().triggerDataRefresh(), 100);
    }
  },
  setIsDateRangeActive: (active) => {
    localStorage.setItem("isDateRangeActive", active);
    set({ isDateRangeActive: active });
    // Clear data when switching modes
    if (active) {
      set({
        monthlyExpense: 0,
        totalLoansExpense: null,
        expensePieChartData: [],
        yearlyExpenseSummary: null,
        monthlyExpenseData: { categories: [], expenses: [] },
      });
    }
  },
  resetDateRange: () => {
    localStorage.removeItem("fromDate");
    localStorage.removeItem("toDate");
    localStorage.removeItem("isDateRangeActive");
    set({ fromDate: "", toDate: "", isDateRangeActive: false });
    // Clear date range data
    set({
      monthlyExpense: 0,
      totalLoansExpense: null,
      expensePieChartData: [],
      yearlyExpenseSummary: {
        totalYearlyExpense: 0,
        totalLoansExpense: 0,
        expensePieChartData: [],
        expenses: [],
        categories: [],
      },
      monthlyExpenseData: { categories: [], expenses: [] },
    });
    // Trigger data refresh after a small delay to ensure state is updated
    setTimeout(() => get().triggerDataRefresh(), 100);
  },
  setSelectedMonth: (month) => {
    const m = Number(month);
    localStorage.setItem("selectedMonth", m);
    const currentYear = Number(localStorage.getItem("selectedYear")) || new Date().getFullYear();
    set({ selectedMonth: m });
    // Clear date range data when switching to month/year mode
    if (localStorage.getItem("isDateRangeActive") === "true") {
      localStorage.removeItem("fromDate");
      localStorage.removeItem("toDate");
      localStorage.removeItem("isDateRangeActive");
      set({ fromDate: "", toDate: "", isDateRangeActive: false });
    }
    // Clear data when switching modes
    if (Number(month) === 0) {
      set({
        monthlyExpense: 0,
        totalLoansExpense: null,
        expensePieChartData: [],
      });
    } else {
      set({
        yearlyExpenseSummary: {
          totalYearlyExpense: 0,
          totalLoansExpense: 0,
          expensePieChartData: [],
          expenses: [],
          categories: [],
        },
      });
    }
    // Trigger data refresh after a small delay to ensure state is updated
    setTimeout(() => get().triggerDataRefresh(), 100);
  },
  setSelectedYear: (year) => {
    const y = Number(year);
    localStorage.setItem("selectedYear", y);
    const currentMonth = Number(localStorage.getItem("selectedMonth")) || new Date().getMonth() + 1;
    set({ selectedYear: y });
    // Clear date range data when switching to month/year mode
    if (localStorage.getItem("isDateRangeActive") === "true") {
      localStorage.removeItem("fromDate");
      localStorage.removeItem("toDate");
      localStorage.removeItem("isDateRangeActive");
      set({ fromDate: "", toDate: "", isDateRangeActive: false });
    }
    // Trigger data refresh after a small delay to ensure state is updated
    setTimeout(() => get().triggerDataRefresh(), 100);
  },
  getMonthlyExpense: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/expense/monthly-expense`, {
        params: { month, year },
      });
      set({ monthlyExpense: response.data.monthlyExpense || 0, loading: false });
    } catch (error) {
      set({ monthlyExpense: 0, loading: false });
      throw error;
    }
  },
  getTotalLoansExpense: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/expense/loans-expense`, {
        params: { month, year },
      });
      set({ totalLoansExpense: response.data.totalLoansExpense || 0, loading: false });
    } catch (error) {
      set({ totalLoansExpense: 0, loading: false });
      throw error;
    }
  },
  getExpensePieChartData: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/expense-pie-chart-data`,
        {
          params: { month, year },
        }
      );
      const pieChartData = response.data.expensePieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({ expensePieChartData: pieChartData });
      set({ monthlyExpense: response.data.totalMonthlyExpense });
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  getYearlyExpenseSummary: async (year) => {
    set({ loading: true });
    try {
      // First try to get summary data
      const summaryResponse = await axiosInstance.get(`/expense/yearly-expense`, { 
        params: { year } 
      });
      
      
      // Format pie chart data for consistency
      const pieChartData = summaryResponse.data.expensePieChartData?.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      })) || [];
      
      // Collect all expenses from monthly data for table
      const allExpenses = [];
      const allCategories = new Set();
      
      // Fetch data for all 12 months
      for (let month = 1; month <= 12; month++) {
        try {
          const monthResponse = await axiosInstance.get(`/expense/monthly-expense-data`, {
            params: { month, year }
          });
          if (monthResponse.data.expenses) {
            allExpenses.push(...monthResponse.data.expenses);
          }
          if (monthResponse.data.categories) {
            monthResponse.data.categories.forEach(cat => allCategories.add(cat));
          }
        } catch (monthError) {
        }
      }
      
      
      set({
        yearlyExpenseSummary: {
          totalYearlyExpense: summaryResponse.data.totalYearlyExpense,
          totalLoansExpense: summaryResponse.data.totalLoansExpense,
          expensePieChartData: pieChartData,
          expenses: allExpenses,
          categories: Array.from(allCategories),
        },
        loading: false,
      });
      
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  getMonthlyExpenseData: async (month, year) => {
    if (Number(month) === 0) return; // Don't fetch if 'All' selected
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/monthly-expense-data`,
        {
          params: { month, year },
        }
      );
      set({ monthlyExpenseData: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  getExpenseCategories: async () => {
    try {
      const response = await axiosInstance.get("/expense/categories");
      set({
        categories: response.data.categories,
        categorySubMap: response.data.categorySubMap,
      });
    } catch (error) {
      set({ categories: [], categorySubMap: {} });
    }
  },
  addExpense: async (expenseData) => {
    try {
      let dataToSend = expenseData;
      let config = {};
      // If file is present, use FormData
      if (expenseData.file) {
        const formData = new FormData();
        Object.entries(expenseData).forEach(([key, value]) => {
          if (key === "file") {
            if (value) formData.append(key, value);
          } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
          }
        });
        dataToSend = formData;
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const response = await axiosInstance.post(
        "/expense/add-expense",
        dataToSend,
        config
      );
      toast.success("Expense added successfully!");
      // Trigger data refresh for real-time updates
      get().triggerDataRefresh();
      return response.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to add expense. Please try again."
      );
      throw error;
    }
  },
  deleteExpense: async (id) => {
    try {
      await axiosInstance.delete(`/expense/delete-expense/${id}`);
      toast.success("Expense deleted successfully!");
      // Trigger data refresh for real-time updates
      get().triggerDataRefresh();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to delete expense. Please try again."
      );
      throw error;
    }
  },
  updateExpense: async (id, expenseData) => {
    try {
      let dataToSend = expenseData;
      let config = {};
      if (expenseData.file) {
        const formData = new FormData();
        Object.entries(expenseData).forEach(([key, value]) => {
          if (key === "file") {
            if (value) formData.append(key, value);
          } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
          }
        });
        dataToSend = formData;
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const response = await axiosInstance.put(
        `/expense/update-expense/${id}`,
        dataToSend,
        config
      );
      toast.success("Expense updated successfully!");
      // Trigger data refresh for real-time updates
      get().triggerDataRefresh();
      return response.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update expense. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  },
  // New date range filter functions
  getDateRangeExpense: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/expense/date-range-expense`, {
        params: { fromDate, toDate },
      });
      set({ monthlyExpense: response.data.totalExpense, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  getDateRangeLoansExpense: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/date-range-loans-expense`,
        {
          params: { fromDate, toDate },
        }
      );
      set({
        totalLoansExpense: response.data.totalLoansExpense,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  getDateRangePieChartData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/date-range-pie-chart-data`,
        {
          params: { fromDate, toDate },
        }
      );
      const pieChartData = response.data.expensePieChartData.map((item) => ({
        x: item.category,
        y: Number(item.totalAmount),
        text: `${item.percentage} %`,
      }));
      set({
        expensePieChartData: pieChartData,
        monthlyExpense: response.data.totalExpense,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  getDateRangeExpenseData: async (fromDate, toDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        `/expense/date-range-expense-data`,
        {
          params: { fromDate, toDate },
        }
      );
      set({ monthlyExpenseData: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  // Custom Cards operations
  getCustomCards: async () => {
    try {
      const response = await axiosInstance.get("/custom-cards");
      return response.data.cards || [];
    } catch (error) {
      console.error("Error fetching custom cards:", error);
      throw error;
    }
  },
  createCustomCard: async (cardData) => {
    try {
      const response = await axiosInstance.post("/custom-cards", cardData);
      toast.success("Custom card created successfully!");
      get().triggerDataRefresh();
      return response.data.card;
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to create custom card. Please try again."
      );
      throw error;
    }
  },
  updateCustomCard: async (cardId, cardData) => {
    try {
      const response = await axiosInstance.put(`/custom-cards/${cardId}`, cardData);
      toast.success("Custom card updated successfully!");
      get().triggerDataRefresh();
      return response.data.card;
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to update custom card. Please try again."
      );
      throw error;
    }
  },
  deleteCustomCard: async (cardId) => {
    try {
      await axiosInstance.delete(`/custom-cards/${cardId}`);
      toast.success("Custom card deleted successfully!");
      get().triggerDataRefresh();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to delete custom card. Please try again."
      );
      throw error;
    }
  },
  // Custom In Hand operations
  getCustomInHand: async () => {
    try {
      const response = await axiosInstance.get("/custom-inhand");
      return response.data.inHandConfig || { userId: null, selectedCards: [] };
    } catch (error) {
      console.error("Error fetching custom in hand config:", error);
      return { userId: null, selectedCards: [] };
    }
  },
  saveCustomInHand: async (selectedCards) => {
    try {
      const response = await axiosInstance.post("/custom-inhand", {
        selectedCards,
      });
      toast.success("Custom in hand formula saved successfully!");
      get().triggerDataRefresh();
      return response.data.inHandConfig;
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to save custom in hand configuration. Please try again."
      );
      throw error;
    }
  },
  updateCustomInHand: async (selectedCards) => {
    try {
      const response = await axiosInstance.put("/custom-inhand", {
        selectedCards,
      });
      toast.success("Custom in hand formula updated successfully!");
      get().triggerDataRefresh();
      return response.data.inHandConfig;
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to update custom in hand configuration. Please try again."
      );
      throw error;
    }
  },
  deleteCustomInHand: async () => {
    try {
      await axiosInstance.delete("/custom-inhand");
      toast.success("Custom in hand configuration deleted successfully!");
      get().triggerDataRefresh();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to delete custom in hand configuration. Please try again."
      );
      throw error;
    }
  },
}));

export default useExpenseStore;
