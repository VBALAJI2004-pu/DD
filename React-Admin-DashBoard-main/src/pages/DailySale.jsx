import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { FiPlus, FiEye } from "react-icons/fi";
import useSalesStore from "../Store/SalesStore";
import { AttachmentModal } from "../components";
import { useAuth } from "../contexts/AuthContext";
 

const DailySale = () => {
  const { currentColor, currentMode } = useStateContext();
  const { user } = useAuth();
  const { addSales, addOrder } = useSalesStore();
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState({
    isOpen: false,
    fileUrl: "",
    fileName: ""
  });
  const salesFileInputRef = useRef(null);
  const orderFileInputRef = useRef(null);

  // Today's date in YYYY-MM-DD for max attribute of date inputs
  const today = new Date().toISOString().split("T")[0];

  // Form states
  const [salesForm, setSalesForm] = useState({
    date: "",
    openingCash: "",
    purchaseCash: "",
    onlineCash: "",
    physicalCash: "",
    cashTransferred: "",
    closingCash: "",
    totalSales: 0, // start with 0
    remarks: "",
    file: null,
  });

  // Update totalSales automatically
  useEffect(() => {
    const openingCash = Number(salesForm.openingCash) || 0;
    const purchaseCash = Number(salesForm.purchaseCash) || 0;
    const onlineCash = Number(salesForm.onlineCash) || 0;
    const physicalCash = Number(salesForm.physicalCash) || 0;

    const total = physicalCash + onlineCash + purchaseCash - openingCash;

    setSalesForm((prev) => ({ ...prev, totalSales: total }));
  }, [
    salesForm.openingCash,
    salesForm.purchaseCash,
    salesForm.onlineCash,
    salesForm.physicalCash,
  ]);

  const [orderForm, setOrderForm] = useState({
    orderDate: "",
    deliveryDate: "",
    orderId: "",
    amount: "",
    paymentMode: "",
    file: null,
    remarks: "",
  });

  const handleSalesFormChange = (e) => {
    const { name, value, type, files } = e.target;
    setSalesForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleOrderFormChange = (e) => {
    const { name, value, type, files } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSalesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addSales(salesForm);
      // Reset form
      setSalesForm({
        date: "",
        openingCash: "",
        purchaseCash: "",
        onlineCash: "",
        physicalCash: "",
        cashTransferred: "",
        closingCash: "",
        totalSales: 0,
        remarks: "",
        file: null,
      });
      setShowSalesForm(false);
      if (salesFileInputRef.current) salesFileInputRef.current.value = "";
    } catch (err) {
      // error toast handled in store
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addOrder(orderForm);
      // Reset form
      setOrderForm({
        orderDate: "",
        deliveryDate: "",
        orderId: "",
        amount: "",
        paymentMode: "",
        file: null,
        remarks: "",
      });
      setShowOrderForm(false);
      if (orderFileInputRef.current) orderFileInputRef.current.value = "";
    } catch (err) {
      // error toast handled in store
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className={`flex justify-center items-start min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-8 px-2 sm:px-4 main-content-mobile overflow-x-hidden ${
        currentMode === "Dark" ? "bg-[#23272e]" : "bg-gray-100"
      }`}
    >
      <div className="w-full max-w-6xl min-w-0">
        <div
          className={`bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl m-1 sm:m-2 md:m-3 p-2 sm:p-3 md:p-4 rounded-2xl w-full min-w-0 ${
            currentMode === "Dark" ? "bg-[#23272e]" : "bg-white"
          }`}
        >
          <div
            className={`m-1 sm:m-2 md:m-4 lg:m-6 p-2 sm:p-4 md:p-6 lg:p-10 pb-4 mt-4 sm:mt-6 md:mt-8 lg:mt-12 rounded-xl md:rounded-3xl w-full min-w-0 overflow-hidden ${
              currentMode === "Dark" ? "bg-secondary-dark-bg" : "bg-gray-200"
            }`}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Daily Sales & Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add new sales entries and orders using the forms below
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
              <button
                onClick={() => {
                  setShowSalesForm(!showSalesForm);
                  setShowOrderForm(false);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <FiPlus /> Add Sales
              </button>
              {/* Add Order Button - Hidden for Staff */}
              {user?.role !== 'staff' && (
                <button
                  onClick={() => {
                    setShowOrderForm(!showOrderForm);
                    setShowSalesForm(false);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <FiPlus /> Add Order
                </button>
              )}
            </div>

            {/* Sales Form */}
            {showSalesForm && (
              <div
                className={`rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 w-full min-w-0 overflow-hidden ${
                  currentMode === "Dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add Sales Entry
                </h3>
                <form onSubmit={handleSalesSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={salesForm.date}
                      onChange={handleSalesFormChange}
                      required
                      max={today}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Opening Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="openingCash"
                        value={salesForm.openingCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchase Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="purchaseCash"
                        value={salesForm.purchaseCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Online Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="onlineCash"
                        value={salesForm.onlineCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Physical Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="physicalCash"
                        value={salesForm.physicalCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cash Transferred <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        name="cashTransferred"
                        value={salesForm.cashTransferred}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Closing Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        name="closingCash"
                        value={salesForm.closingCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Sale <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      name="totalSales"
                      readOnly
                      value={salesForm.totalSales}
                      onChange={handleSalesFormChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      rows={2}
                      value={salesForm.remarks}
                      onChange={handleSalesFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Attachment
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        name="file"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleSalesFormChange}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        ref={salesFileInputRef}
                      />
                      {salesForm.file && (
                        <button
                          type="button"
                          onClick={() => {
                            const fileUrl = URL.createObjectURL(salesForm.file);
                            setAttachmentModal({
                              isOpen: true,
                              fileUrl: fileUrl,
                              fileName: salesForm.file.name
                            });
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <FiEye size={16} />
                          View
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Allowed: Images, PDFs, Word files. Max size: 10MB.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSalesForm(false)}
                      className="px-6 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 hover:dark:bg-gray-600"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded font-semibold text-white"
                      style={{
                        background: currentColor,
                        opacity: loading ? 0.7 : 1,
                      }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Sales"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Order Form - Hidden for Staff */}
            {showOrderForm && user?.role !== 'staff' && (
              <div
                className={`rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 w-full min-w-0 overflow-hidden ${
                  currentMode === "Dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add Order Entry
                </h3>
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="orderDate"
                      value={orderForm.orderDate}
                      onChange={handleOrderFormChange}
                      required
                      max={today}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={orderForm.deliveryDate}
                      onChange={handleOrderFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="orderId"
                        value={orderForm.orderId}
                        onChange={handleOrderFormChange}
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={orderForm.amount}
                        onChange={handleOrderFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMode"
                      value={orderForm.paymentMode}
                      onChange={handleOrderFormChange}
                      required
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="Cash">Cash</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Attachment
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        name="file"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleOrderFormChange}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        ref={orderFileInputRef}
                      />
                      {orderForm.file && (
                        <button
                          type="button"
                          onClick={() => {
                            const fileUrl = URL.createObjectURL(orderForm.file);
                            setAttachmentModal({
                              isOpen: true,
                              fileUrl: fileUrl,
                              fileName: orderForm.file.name
                            });
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <FiEye size={16} />
                          View
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Allowed: Images, PDFs, Word files. Max size: 10MB.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={orderForm.remarks}
                      onChange={handleOrderFormChange}
                      rows="2"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="px-6 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 hover:dark:bg-gray-600"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded font-semibold text-white"
                      style={{
                        background: currentColor,
                        opacity: loading ? 0.7 : 1,
                      }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Order"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <AttachmentModal
        isOpen={attachmentModal.isOpen}
        onClose={() => setAttachmentModal({ isOpen: false, fileUrl: "", fileName: "" })}
        fileUrl={attachmentModal.fileUrl}
        fileName={attachmentModal.fileName}
      />
    </div>
  );
};

export default DailySale;
