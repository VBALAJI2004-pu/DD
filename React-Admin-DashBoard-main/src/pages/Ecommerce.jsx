import React, { useState, useEffect } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { GoPrimitiveDot } from "react-icons/go";
import { IoIosMore } from "react-icons/io";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { FaRupeeSign } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { useStateContext } from "../contexts/ContextProvider";
import { useRole } from "../contexts/RoleContext";
import useExpenseStore from "../Store/ExpenseStore";
import useSalesStore from "../Store/SalesStore";
import ConfirmationModal from "../components/ConfirmationModal";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Tooltip,
  Category,
  ColumnSeries,
  Legend,
  RangeColorSettingsDirective,
  RangeColorSettingDirective,
} from "@syncfusion/ej2-react-charts";
import ChartsHeader from "../components/ChartsHeader";
import {
  colorMappingData,
  ColorMappingPrimaryXAxis,
  ColorMappingPrimaryYAxis,
  rangeColorMapping,
  earningData,
  dropdownData,
} from "../data/dummy";

const DropDown = ({ currentMode }) => (
  <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{ border: "none", color: currentMode === "Dark" && "white" }}
      value="1"
      dataSource={dropdownData}
      popupHeight="220px"
      popupWidth="120px"
    />
  </div>
);

const CustomInHandModal = ({
  isOpen,
  onClose,
  customCards,
  onSave,
  currentColor,
  currentMode,
  loading,
  initialSelectedCards = [],
}) => {
  const [selectedCards, setSelectedCards] = useState(initialSelectedCards);

  const handleAddCard = () => {
    setSelectedCards([...selectedCards, { cardId: "", cardName: "", operator: "+" }]);
  };

  const handleRemoveCard = (index) => {
    setSelectedCards(selectedCards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...selectedCards];
    newCards[index][field] = value;
    if (field === "cardId") {
      const card = customCards.find((c) => c._id === value);
      newCards[index]["cardName"] = card ? card.name : "";
    }
    setSelectedCards(newCards);
  };

  const handleSave = () => {
    if (selectedCards.length === 0) {
      alert("Please select at least one custom card");
      return;
    }
    if (selectedCards.some((card) => !card.cardId)) {
      alert("Please select a card for all items");
      return;
    }
    onSave(selectedCards);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 ${
          currentMode === "Dark"
            ? "bg-secondary-dark-bg text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Customize In Hand Formula</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Select custom cards to create your in hand formula
        </p>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-4">
            Formula Items *
          </label>
          <div className="space-y-4">
            {selectedCards.map((card, index) => (
              <div key={index} className="flex gap-3 items-center">
                {index > 0 && (
                  <div className="flex-shrink-0">
                    <select
                      value={card.operator}
                      onChange={(e) =>
                        handleCardChange(index, "operator", e.target.value)
                      }
                      className={`px-3 py-3 rounded-lg border-2 focus:outline-none text-sm font-bold transition ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-900"
                      }`}
                      style={{ borderColor: currentColor, minWidth: "70px" }}
                    >
                      <option value="+">➕ Add</option>
                      <option value="-">➖ Sub</option>
                    </select>
                  </div>
                )}
                <select
                  value={card.cardId}
                  onChange={(e) =>
                    handleCardChange(index, "cardId", e.target.value)
                  }
                  className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
                    currentMode === "Dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                  style={{ borderColor: currentColor }}
                >
                  <option value="">Select Custom Card...</option>
                  {customCards.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {selectedCards.length > 1 && (
                  <button
                    onClick={() => handleRemoveCard(index)}
                    className="flex-shrink-0 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddCard}
            className="mt-6 px-5 py-3 rounded-lg font-semibold text-sm transition"
            style={{ background: currentColor, color: "white" }}
          >
            + Add Card
          </button>
        </div>

        <div
          className="flex gap-4 justify-end pt-6 border-t"
          style={{
            borderColor: currentMode === "Dark" ? "#374151" : "#e5e7eb",
          }}
        >
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              currentMode === "Dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ background: currentColor }}
            className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Formula"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomCardModal = ({
  isOpen,
  onClose,
  categories,
  onSave,
  currentColor,
  currentMode,
  loading,
  editingCard = null,
}) => {
  const [cardName, setCardName] = useState("");
  const [cardItems, setCardItems] = useState([{ category: "", operator: "+" }]);

  useEffect(() => {
    if (editingCard) {
      setCardName(editingCard.name);
      setCardItems(editingCard.items);
    } else {
      setCardName("");
      setCardItems([{ category: "", operator: "+" }]);
    }
  }, [editingCard, isOpen]);

  const handleAddItem = () => {
    setCardItems([...cardItems, { category: "", operator: "+" }]);
  };

  const handleRemoveItem = (index) => {
    setCardItems(cardItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...cardItems];
    newItems[index][field] = value;
    setCardItems(newItems);
  };

  const handleSave = () => {
    if (!cardName.trim()) {
      alert("Please enter a card name");
      return;
    }
    if (cardItems.some((item) => !item.category)) {
      alert("Please select categories for all items");
      return;
    }
    const data = { name: cardName, items: cardItems };
    if (editingCard) {
      data.cardId = editingCard._id;
    }
    onSave(data);
    setCardName("");
    setCardItems([{ category: "", operator: "+" }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 ${
          currentMode === "Dark"
            ? "bg-secondary-dark-bg text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            {editingCard ? "Edit Custom Card" : "Create Custom Card"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3">
            Card Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Transport Finder, Material Cost"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
              currentMode === "Dark"
                ? "bg-gray-700 border-gray-600 text-white focus:border-opacity-100"
                : "bg-gray-50 border-gray-300 text-gray-900 focus:border-opacity-100"
            }`}
            style={{ borderColor: currentColor }}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-4">
            Categories Formula *
          </label>
          <div className="space-y-4">
            {cardItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                {index > 0 && (
                  <div className="flex-shrink-0">
                    <select
                      value={item.operator}
                      onChange={(e) =>
                        handleItemChange(index, "operator", e.target.value)
                      }
                      className={`px-3 py-3 rounded-lg border-2 focus:outline-none text-sm font-bold transition ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-900"
                      }`}
                      style={{ borderColor: currentColor, minWidth: "70px" }}
                    >
                      <option value="+">➕ Add</option>
                      <option value="-">➖ Sub</option>
                    </select>
                  </div>
                )}
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleItemChange(index, "category", e.target.value)
                  }
                  className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
                    currentMode === "Dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                  style={{ borderColor: currentColor }}
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {cardItems.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="flex-shrink-0 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddItem}
            className="mt-6 px-5 py-3 rounded-lg font-semibold text-sm transition"
            style={{ background: currentColor, color: "white" }}
          >
            + Add Category
          </button>
        </div>

        <div
          className="flex gap-4 justify-end pt-6 border-t"
          style={{
            borderColor: currentMode === "Dark" ? "#374151" : "#e5e7eb",
          }}
        >
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              currentMode === "Dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ background: currentColor }}
            className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? editingCard
                ? "Saving..."
                : "Creating..."
              : editingCard
                ? "Save Changes"
                : "Create Card"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Ecommerce = () => {
  const { currentColor, currentMode } = useStateContext();
  const { permissions } = useRole();
  const [isMobile, setIsMobile] = useState(false);
  const [customCards, setCustomCards] = useState([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardModalLoading, setCardModalLoading] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    cardId: null,
    cardName: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showInHandModal, setShowInHandModal] = useState(false);
  const [inHandModalLoading, setInHandModalLoading] = useState(false);
  const [customInHandConfig, setCustomInHandConfig] = useState({
    selectedCards: [],
  });
  const {
    selectedMonth,
    selectedYear,
    getMonthlyExpense,
    getTotalLoansExpense,
    monthlyExpense,
    totalLoansExpense,
    loading: expenseLoading,
    getYearlyExpenseSummary,
    yearlyExpenseSummary,
    // Date range filter
    fromDate,
    toDate,
    isDateRangeActive,
    getDateRangeExpense,
    getDateRangeLoansExpense,
    dataRefreshTrigger,
    categories,
    getExpenseCategories,
    getMonthlyExpenseData,
    monthlyExpenseData,
    getCustomCards,
    createCustomCard,
    updateCustomCard,
    deleteCustomCard,
    getCustomInHand,
    saveCustomInHand,
    updateCustomInHand,
    deleteCustomInHand,
  } = useExpenseStore();

  const {
    totalSales,
    loading: salesLoading,
    getTotalSales,
    getYearlySales,
    yearlyTotalSales,
    getDateRangeTotalSales,
    getDailySalesData,
    dailySalesData,
    dailySalesTotal,
  } = useSalesStore();

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1023);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch categories and custom cards on mount and when data refreshes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getExpenseCategories();
        if (permissions.canSeeAllCards) {
          const cards = await getCustomCards();
          setCustomCards(cards);
          const inHandConfig = await getCustomInHand();
          setCustomInHandConfig(inHandConfig);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [permissions.canSeeAllCards, dataRefreshTrigger]);

  // Clean up custom in hand config when custom cards change (e.g., when cards are deleted)
  useEffect(() => {
    if (
      customInHandConfig.selectedCards &&
      customInHandConfig.selectedCards.length > 0
    ) {
      const validCards = customInHandConfig.selectedCards.filter((selectedCard) =>
        customCards.some((card) => card._id === selectedCard.cardId),
      );

      // If some cards are no longer valid, update the config
      if (validCards.length !== customInHandConfig.selectedCards.length) {
        if (validCards.length === 0) {
          // All cards deleted, clear config
          setCustomInHandConfig({ selectedCards: [] });
        } else {
          // Update config with only valid cards
          setCustomInHandConfig({
            ...customInHandConfig,
            selectedCards: validCards,
          });
        }
      }
    }
  }, [customCards]);

  // Fetch expense and sales data based on selected period
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isDateRangeActive && fromDate && toDate) {
          // Use date range filter
          await Promise.all([
            getDateRangeExpense(fromDate, toDate),
            getDateRangeLoansExpense(fromDate, toDate),
            getDateRangeTotalSales(fromDate, toDate),
            getDateRangeExpenseData(fromDate, toDate),
          ]);
        } else {
          // Use month/year filter
          if (selectedMonth === 0) {
            await Promise.all([
              getYearlyExpenseSummary(selectedYear),
              getYearlySales(selectedYear),
            ]);
          } else {
            await Promise.all([
              getMonthlyExpense(selectedMonth, selectedYear),
              getTotalLoansExpense(selectedMonth, selectedYear),
              getTotalSales(selectedMonth, selectedYear),
              getMonthlyExpenseData(selectedMonth, selectedYear),
              getDailySalesData(selectedMonth, selectedYear),
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    selectedMonth,
    selectedYear,
    isDateRangeActive,
    fromDate,
    toDate,
    dataRefreshTrigger,
  ]);

  // Use yearly or monthly data based on selection
  const displayExpense = isDateRangeActive
    ? monthlyExpense // For date range, use monthlyExpense which gets set by getDateRangeExpense
    : selectedMonth === 0
      ? yearlyExpenseSummary?.totalYearlyExpense
      : monthlyExpense;

  const displayLoans = isDateRangeActive
    ? totalLoansExpense // For date range, use totalLoansExpense which gets set by getDateRangeLoansExpense
    : selectedMonth === 0
      ? yearlyExpenseSummary?.totalLoansExpense
      : totalLoansExpense;

  const displaySales = isDateRangeActive
    ? totalSales // For date range, use totalSales which gets set by getDateRangeTotalSales
    : selectedMonth === 0
      ? yearlyTotalSales
      : totalSales;

  // Calculate In Hand Cash: Sales - Other Expenses + Loans/EMI/Interest
  // Note: displayExpense already excludes Loans & Interests from backend
  const calculateInHandCash = () => {
    const sales = Number(displaySales) || 0;
    const otherExpenses = Number(displayExpense) || 0; // This already excludes loans from backend
    const loansAndInterest = Number(displayLoans) || 0;

    // Formula: inhand = total sale - other expenses + Loans, EMI & Interest
    const inHandAmount = sales - otherExpenses + loansAndInterest;
    return inHandAmount;
  };

  const inHandCash = calculateInHandCash();
  // displayExpense is already other expenses (backend excludes loans)
  const otherExpenses = Number(displayExpense) || 0;

  // Get all expense values by category - dynamically based on selected period
  const expensesByCategory = () => {
    const map = {};
    let data = [];

    // Select appropriate data source based on current filter
    if (selectedMonth === 0) {
      // Full year view
      data = yearlyExpenseSummary?.expenses || [];
    } else {
      // Monthly or date range view (both store in monthlyExpenseData)
      data = monthlyExpenseData?.expenses || [];
    }

    // Build category map from expense data
    data.forEach((exp) => {
      if (exp.category && exp.category !== "Loans & Interests") {
        map[exp.category] = (map[exp.category] || 0) + (exp.amount || 0);
      }
    });

    // Add special categories using display values
    map["Total Sales"] = displaySales || 0;
    map["Total Expenses"] = displayExpense || 0;
    map["Loans & Interests"] = displayLoans || 0;

    return map;
  };

  // Calculate custom card value
  const calculateCustomCardValue = (cardItems) => {
    const categoryValues = expensesByCategory();
    let result = 0;

    cardItems.forEach((item, index) => {
      const value = categoryValues[item.category] || 0;
      if (index === 0) {
        result = value;
      } else if (item.operator === "+") {
        result += value;
      } else if (item.operator === "-") {
        result -= value;
      }
    });

    return result;
  };

  // Handle save custom card (create or update)
  const handleSaveCustomCard = async (cardData) => {
    setCardModalLoading(true);
    try {
      if (cardData.cardId) {
        // Update existing card
        const updatedCard = await updateCustomCard(cardData.cardId, {
          name: cardData.name,
          items: cardData.items,
        });
        setCustomCards(
          customCards.map((card) =>
            card._id === cardData.cardId ? updatedCard : card,
          ),
        );
      } else {
        // Create new card
        const newCard = await createCustomCard({
          name: cardData.name,
          items: cardData.items,
        });
        setCustomCards([...customCards, newCard]);
      }
      setShowCardModal(false);
      setEditingCard(null);
    } catch (error) {
      console.error("Error saving custom card:", error);
    } finally {
      setCardModalLoading(false);
    }
  };

  // Handle edit custom card
  const handleEditCustomCard = (card) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  // Handle delete custom card - show confirmation first
  const handleDeleteCustomCard = (cardId, cardName) => {
    setDeleteConfirmation({
      isOpen: true,
      cardId,
      cardName,
    });
  };

  // Confirm and delete card
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteCustomCard(deleteConfirmation.cardId);
      setCustomCards(
        customCards.filter((card) => card._id !== deleteConfirmation.cardId),
      );

      // Remove deleted card from custom in hand config if it exists
      if (
        customInHandConfig.selectedCards &&
        customInHandConfig.selectedCards.length > 0
      ) {
        const updatedSelectedCards = customInHandConfig.selectedCards.filter(
          (card) => card.cardId !== deleteConfirmation.cardId,
        );

        if (updatedSelectedCards.length === 0) {
          // If no cards left, delete the custom in hand config
          await deleteCustomInHand();
          setCustomInHandConfig({ selectedCards: [] });
        } else if (
          updatedSelectedCards.length <
          customInHandConfig.selectedCards.length
        ) {
          // If some cards were removed, update the config
          await updateCustomInHand(updatedSelectedCards);
          setCustomInHandConfig({
            ...customInHandConfig,
            selectedCards: updatedSelectedCards,
          });
        }
      }

      setDeleteConfirmation({ isOpen: false, cardId: null, cardName: "" });
    } catch (error) {
      console.error("Error deleting custom card:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle save in hand custom configuration
  const handleSaveInHand = async (selectedCards) => {
    setInHandModalLoading(true);
    try {
      const result = customInHandConfig._id
        ? await updateCustomInHand(selectedCards)
        : await saveCustomInHand(selectedCards);
      setCustomInHandConfig(result);
      setShowInHandModal(false);
    } catch (error) {
      console.error("Error saving in hand configuration:", error);
    } finally {
      setInHandModalLoading(false);
    }
  };

  // Get valid selected cards (only those that still exist in customCards)
  const getValidSelectedCards = () => {
    if (!customInHandConfig.selectedCards || customInHandConfig.selectedCards.length === 0) {
      return [];
    }

    return customInHandConfig.selectedCards.filter((selectedCard) =>
      customCards.some((card) => card._id === selectedCard.cardId),
    );
  };

  // Calculate custom in hand value
  const calculateCustomInHandValue = () => {
    const validSelectedCards = getValidSelectedCards();
    if (validSelectedCards.length === 0) {
      return 0;
    }

    const categoryValues = expensesByCategory();
    let result = 0;

    validSelectedCards.forEach((item, index) => {
      const card = customCards.find((c) => c._id === item.cardId);
      if (card) {
        const value = calculateCustomCardValue(card.items);
        if (index === 0) {
          result = value;
        } else if (item.operator === "+") {
          result += value;
        } else if (item.operator === "-") {
          result -= value;
        }
      }
    });

    return result;
  };

  return (
    <div className="main-content-mobile">
      {expenseLoading || salesLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <div className="w-full px-2 md:px-0 mt-[-70px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full ecommerce-cards">
            {/* Show only Sales chart for Staff, all cards for others */}
            {permissions.canSeeAllCards && (
              <>
                {/* In Hand Card */}
                <div
                  className="bg-white dark:text-gray-500 dark:bg-secondary-dark-bg shadow-2xl h-44 rounded-xl w-full p-8 pt-9 bg-hero-pattern bg-no-repeat bg-cover bg-center flex flex-col justify-between ecommerce-card relative group"
                  title="In Hand = Sales - Total Expenses + Loans, EMI & Interest"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-black text-xl">In Hand</p>
                      <p
                        className={`text-2xl mt-10 ${
                          inHandCash <= 0
                            ? "text-red-500"
                            : inHandCash > 0 && inHandCash <= 50000
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}
                      >
                        ₹{inHandCash.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <button
                      type="button"
                      style={{ background: currentColor }}
                      className="text-2xl opacity-0.9 text-white hover:drop-shadow-xl rounded-full p-4"
                    >
                      <FaRupeeSign />
                    </button>
                  </div>
                  {/* Hover Breakdown */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <div className="font-bold mb-2 text-sm whitespace-nowrap">
                      Calculation Breakdown:
                    </div>
                    <div className="flex flex-col gap-1.5 font-semibold text-left">
                      <div className="flex justify-between gap-6">
                        <span className="whitespace-nowrap">Sales:</span>
                        <span className="text-green-400 whitespace-nowrap">
                          ₹{Number(displaySales || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="border-t border-gray-700 my-0.5"></div>
                      <div className="flex justify-between gap-6">
                        <span className="whitespace-nowrap">
                          - Other Expenses:
                        </span>
                        <span className="text-red-400 whitespace-nowrap">
                          ₹{Number(otherExpenses || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="border-t border-gray-700 my-0.5"></div>
                      <div className="flex justify-between gap-6">
                        <span className="whitespace-nowrap">
                          + Loans, EMI & Interest:
                        </span>
                        <span className="text-blue-400 whitespace-nowrap">
                          ₹{Number(displayLoans || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="border-t border-gray-700 my-1"></div>
                      <div className="flex justify-between gap-6">
                        <span className="text-yellow-300 whitespace-nowrap">
                          = In Hand:
                        </span>
                        <span
                          className={`font-bold ${
                            inHandCash <= 0
                              ? "text-red-300"
                              : inHandCash > 0 && inHandCash <= 50000
                                ? "text-yellow-300"
                                : "text-green-300"
                          } whitespace-nowrap`}
                        >
                          ₹{inHandCash.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>

                {/* In Hand (Custom) Card */}
                {customCards.length > 0 ? (
                  <div
                    className="bg-white dark:text-gray-500 dark:bg-secondary-dark-bg shadow-2xl h-44 rounded-xl w-full p-8 pt-9 bg-hero-pattern bg-no-repeat bg-cover bg-center flex flex-col justify-between ecommerce-card relative group"
                    title="Custom formula based on selected cards"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-bold text-black text-xl">In Hand (Custom)</p>
                        {getValidSelectedCards().length > 0 ? (
                          <>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 max-w-sm break-words">
                              {getValidSelectedCards().map((card, idx) => (
                                <div key={idx} className="inline-flex items-center gap-1.5">
                                  {idx > 0 && (
                                    <span className="font-bold text-xs px-1" style={{ color: card.operator === '+' ? '#059669' : '#dc2626' }}>
                                      {card.operator === '+' ? '+' : '−'}
                                    </span>
                                  )}
                                  <span className="font-semibold truncate" title={card.cardName}>
                                    {card.cardName}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p
                              className={`text-2xl mt-4 font-bold ${
                                calculateCustomInHandValue() <= 0
                                  ? "text-red-500"
                                  : calculateCustomInHandValue() > 0 && calculateCustomInHandValue() <= 50000
                                    ? "text-yellow-500"
                                    : "text-green-500"
                              }`}
                            >
                              ₹{Math.round(calculateCustomInHandValue()).toLocaleString("en-IN")}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                            Click customize to setup formula
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowInHandModal(true)}
                        type="button"
                        style={{ background: currentColor }}
                        className="text-2xl opacity-0.9 text-white hover:drop-shadow-xl rounded-full p-4"
                        title="Customize formula"
                      >
                        <MdEdit />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-white dark:text-gray-500 dark:bg-secondary-dark-bg shadow-2xl h-44 rounded-xl w-full p-8 pt-9 bg-hero-pattern bg-no-repeat bg-cover bg-center flex flex-col justify-between ecommerce-card relative group"
                    title="Create custom cards first"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-black text-xl">In Hand (Custom)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                          Create custom cards first
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled
                        style={{ background: "#ccc" }}
                        className="text-2xl opacity-0.5 text-white rounded-full p-4 cursor-not-allowed"
                      >
                        <MdEdit />
                      </button>
                    </div>
                  </div>
                )}

                {/* Earnings Cards */}
                {earningData(otherExpenses, displayLoans, displaySales).map(
                  (item) => (
                    <div
                      key={item.title}
                      className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl w-full p-4 pt-4 rounded-xl flex flex-col justify-between ecommerce-card relative group"
                      title={item.tooltip || `${item.title}: ${item.amount}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-base text-gray-700 dark:text-gray-200">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          style={{
                            color: item.iconColor,
                            backgroundColor: item.iconBg,
                          }}
                          className="text-2xl rounded-full p-3 hover:drop-shadow-xl flex-shrink-0 ml-2"
                        >
                          {item.icon}
                        </button>
                      </div>
                      <div className="flex flex-col justify-end flex-grow">
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                          {item.amount}
                        </p>
                        {item.percentage && (
                          <span
                            className="text-sm font-semibold"
                            style={{ color: item.pcColor }}
                          >
                            {item.percentage}
                          </span>
                        )}
                      </div>
                      {/* Mobile Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 lg:hidden">
                        <div className="whitespace-nowrap font-semibold">
                          {item.title}
                        </div>
                        <div className="text-xs mt-1">{item.description}</div>
                        <div className="text-base font-bold mt-1">
                          {item.amount}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  ),
                )}
              </>
            )}

            {/* For Staff users, show only a simple sales chart */}
            {permissions.isStaff && (
              <div className="col-span-full">
                <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Sales Overview</h3>
                  <p className="text-3xl font-bold text-green-600">
                    ₹
                    {displaySales
                      ? Number(displaySales).toLocaleString("en-IN")
                      : "0"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Total Sales</p>
                </div>
              </div>
            )}
          </div>

          {/* Custom Cards Section */}
          {permissions.canSeeAllCards && customCards.length > 0 && (
            <div className="mt-12 mb-10">
              <h3 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                Custom Cards
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {customCards.map((card) => (
                  <div
                    key={card._id}
                    className="bg-white dark:bg-secondary-dark-bg shadow-2xl rounded-3xl overflow-hidden h-auto flex flex-col justify-between ecommerce-card hover:shadow-3xl transition-all duration-300 relative group border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6 flex flex-col justify-between h-full">
                      {/* Header with title and action buttons */}
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white flex-1 min-w-0 line-clamp-2">
                          {card.name}
                        </h4>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditCustomCard(card)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 dark:hover:bg-opacity-40 transition-all duration-200 hover:scale-110"
                            title="Edit custom card"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCustomCard(card._id, card.name)
                            }
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:bg-opacity-40 transition-all duration-200 hover:scale-110"
                            title="Delete custom card"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Card Items/Formula */}
                      <div className="space-y-2 mb-6 flex-1">
                        {card.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {idx > 0 && (
                              <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                                style={{
                                  backgroundColor:
                                    item.operator === "+"
                                      ? "rgba(34, 197, 94, 0.15)"
                                      : "rgba(239, 68, 68, 0.15)",
                                  color:
                                    item.operator === "+"
                                      ? "#16a34a"
                                      : "#dc2626",
                                }}
                              >
                                {item.operator === "+" ? "+" : "−"}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {item.category}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Value */}
                      <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                          Total
                        </p>
                        <p
                          className="text-4xl font-bold tracking-tight"
                          style={{
                            color:
                              calculateCustomCardValue(card.items) >= 0
                                ? "#059669"
                                : "#dc2626",
                          }}
                        >
                          ₹{Math.round(calculateCustomCardValue(card.items)).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Card Button */}
          {permissions.canSeeAllCards && (
            <div className="mt-8 mb-8">
              <button
                onClick={() => setShowCardModal(true)}
                style={{ background: currentColor }}
                className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition flex items-center gap-2"
              >
                + Add Custom Card
              </button>
            </div>
          )}

          {/* Custom Card Modal */}
          <CustomCardModal
            isOpen={showCardModal}
            onClose={() => {
              setShowCardModal(false);
              setEditingCard(null);
            }}
            categories={categories}
            onSave={handleSaveCustomCard}
            currentColor={currentColor}
            currentMode={currentMode}
            loading={cardModalLoading}
            editingCard={editingCard}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={() =>
              setDeleteConfirmation({ isOpen: false, cardId: null, cardName: "" })
            }
            onConfirm={handleConfirmDelete}
            title="Delete Custom Card"
            message={`Are you sure you want to delete the custom card "${deleteConfirmation.cardName}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            loading={deleteLoading}
          />

          {/* Custom In Hand Modal */}
          <CustomInHandModal
            isOpen={showInHandModal}
            onClose={() => setShowInHandModal(false)}
            customCards={customCards}
            onSave={handleSaveInHand}
            currentColor={currentColor}
            currentMode={currentMode}
            loading={inHandModalLoading}
            initialSelectedCards={customInHandConfig.selectedCards || []}
          />

          {/* Show chart only when a specific month is selected (not 'All' and not date range) */}
          {selectedMonth !== 0 && !isDateRangeActive && (
            <div className="flex gap-6 sm:gap-10 flex-col items-center justify-center mt-6">
              <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl m-2 sm:m-3 p-3 sm:p-4 rounded-2xl w-full max-w-6xl">
                <div className="m-2 p-2 pb-4 md:p-6 lg:p-10 md:m-6 lg:m-10 mt-6 sm:mt-8 md:mt-12 lg:mt-16 md:rounded-3xl dark:bg-secondary-dark-bg rounded-xl bg-gray-200 w-full">
                  <ChartsHeader
                    category="Sale Report"
                    title={`DAILY SALES & ORDERS - Total: ₹${dailySalesTotal ? Number(dailySalesTotal).toLocaleString("en-IN") : "0"}`}
                  />
                  <div
                    className="w-full chart-container relative"
                    style={{
                      scrollbarWidth: "thin",
                      msOverflowStyle: "auto",
                    }}
                  >
                    <style>{`
                    .chart-container::-webkit-scrollbar {
                      width: 8px;
                      height: 8px;
                    }
                    
                    .chart-container::-webkit-scrollbar-track {
                      background: rgba(0, 0, 0, 0.1);
                      border-radius: 4px;
                    }
                    
                    .chart-container::-webkit-scrollbar-thumb {
                      background: ${currentColor};
                      border-radius: 4px;
                      opacity: 0.7;
                    }
                    
                    .chart-container::-webkit-scrollbar-thumb:hover {
                      background: ${currentColor};
                      opacity: 1;
                    }
                    
                    
                    /* Desktop - no scroll, fit to container */
                    @media (min-width: 1024px) {
                      .chart-container {
                        overflow: visible;
                      }
                      .chart-container::-webkit-scrollbar {
                        display: none;
                      }
                      .chart-inner {
                        width: 100% !important;
                        min-width: auto !important;
                      }
                    }
                    
                    /* Mobile/Tablet - enable swipe-only scrolling */
                    @media (max-width: 1023px) {
                      .chart-container {
                        overflow-x: auto !important;
                        overflow-y: hidden !important;
                        -webkit-overflow-scrolling: touch;
                        scroll-behavior: smooth;
                        touch-action: pan-x;
                        position: relative;
                        z-index: 1;
                        height: 420px;
                        scrollbar-width: thin;
                        scrollbar-color: ${currentColor} rgba(0, 0, 0, 0.1);
                        cursor: default;
                      }
                      .chart-container::-webkit-scrollbar {
                        width: 12px !important;
                        height: 12px !important;
                        display: block !important;
                      }
                      .chart-container::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.1) !important;
                        border-radius: 6px !important;
                      }
                      .chart-container::-webkit-scrollbar-thumb {
                        background: ${currentColor} !important;
                        border-radius: 6px !important;
                        opacity: 1 !important;
                      }
                      .chart-inner {
                        min-width: 1600px !important;
                        width: 1600px !important;
                        height: 400px;
                        position: relative;
                      }
                      
                      /* Enable swipe scrolling only on mobile */
                      .chart-inner svg,
                      .chart-inner .e-chart,
                      .chart-inner .e-chart-series-collection,
                      .chart-inner .e-series,
                      .chart-inner .e-series-group {
                        touch-action: pan-x !important;
                        pointer-events: auto !important;
                      }
                      
                      /* Enable tooltip interaction on bars */
                      .chart-inner rect,
                      .chart-inner path,
                      .chart-inner .e-series-point {
                        touch-action: none !important;
                        pointer-events: auto !important;
                      }
                      
                      /* Container allows horizontal swipe only */
                      .chart-inner {
                        touch-action: pan-x !important;
                        pointer-events: auto !important;
                      }
                      
                      /* Tooltip specific mobile styles */
                      .e-tooltip-wrap {
                        pointer-events: none !important;
                        z-index: 9999 !important;
                      }
                      
                      /* Enhanced tooltip visibility for mobile and desktop */
                      .e-tooltip-wrap {
                        font-size: 14px !important;
                        padding: 12px 16px !important;
                        border-radius: 10px !important;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
                        backdrop-filter: blur(10px) !important;
                        -webkit-backdrop-filter: blur(10px) !important;
                      }
                      
                      @media (max-width: 768px) {
                        .e-tooltip-wrap {
                          font-size: 16px !important;
                          padding: 14px 18px !important;
                          border-radius: 12px !important;
                          box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
                          min-width: 160px !important;
                        }
                      }
                    }
                  `}</style>
                    <div
                      className="chart-inner"
                      style={{ width: "100%", height: "400px" }}
                    >
                      <ChartComponent
                        id="DailySalesChart"
                        primaryXAxis={{
                          valueType: "Category",
                          majorGridLines: { width: 0 },
                          title: "Day of Month",
                          titleStyle: {
                            color:
                              currentMode === "Dark" ? "#FFFFFF" : "#000000",
                            size: "16px",
                            fontWeight: "500",
                          },
                          labelStyle: {
                            color:
                              currentMode === "Dark" ? "#FFFFFF" : "#000000",
                            size: "11px",
                            fontWeight: "500",
                          },
                          labelIntersectAction: "None",
                          interval: 1,
                          edgeLabelPlacement: "Shift",
                          labelPlacement: "OnTicks",
                          tickPosition: "Outside",
                          majorTickLines: { width: 1, height: 5 },
                        }}
                        primaryYAxis={{
                          lineStyle: { width: 0 },
                          majorTickLines: { width: 0 },
                          minorTickLines: { width: 0 },
                          labelFormat: "₹ {value}",
                          title: "Sales + Orders Amount",
                          titleStyle: {
                            color:
                              currentMode === "Dark" ? "#FFFFFF" : "#000000",
                            size: "16px",
                            fontWeight: "500",
                          },
                          labelStyle: {
                            color:
                              currentMode === "Dark" ? "#FFFFFF" : "#000000",
                          },
                        }}
                        chartArea={{ border: { width: 0 } }}
                        background={currentMode === "Dark" ? "#33373E" : "#fff"}
                        legendSettings={{ visible: false }}
                        tooltip={{
                          enable: true,
                          enableMarker: true,
                          shared: false,
                          header: "<b>Daily Sales</b>",
                          border: {
                            width: 2,
                            color: currentColor,
                          },
                          fill: currentMode === "Dark" ? "#33373E" : "#FFFFFF",
                          textStyle: {
                            color:
                              currentMode === "Dark" ? "#FFFFFF" : "#000000",
                            fontFamily: "Segoe UI",
                            fontSize: "14px",
                            fontWeight: "500",
                          },
                          enableAnimation: true,
                          animationDuration: 300,
                          fadeOutDuration: 1000,
                          format: "Day ${point.x}: ${point.y}",
                        }}
                        width="100%"
                        height="400px"
                        pointRender={(args) => {
                          const value = args.point.y;
                          if (value < 10000) {
                            args.fill = "#fa0202"; // bright Red
                          } else if (value >= 10000 && value <= 15000) {
                            args.fill = "#fae602"; // bright Yellow
                          } else {
                            args.fill = "#02fa02"; // bright Green
                          }
                        }}
                        zoomSettings={{
                          enableSelectionZooming: false,
                          enableScrollbar: false,
                        }}
                        enableCanvas={false}
                      >
                        <Inject
                          services={[ColumnSeries, Tooltip, Legend, Category]}
                        />
                        <SeriesCollectionDirective>
                          <SeriesDirective
                            dataSource={dailySalesData}
                            name="Daily Sales + Orders"
                            xName="x"
                            yName="y"
                            type="Column"
                            fill="#6BCF7F"
                            cornerRadius={{
                              topLeft: 10,
                              topRight: 10,
                            }}
                          />
                        </SeriesCollectionDirective>
                      </ChartComponent>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Ecommerce;
