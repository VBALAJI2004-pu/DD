import React from "react";
import { MdClose, MdWarning } from "react-icons/md";
import { useStateContext } from "../contexts/ContextProvider";

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  loading = false 
}) => {
  const { currentMode } = useStateContext();

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          button: "bg-red-600 hover:bg-red-700",
          border: "border-red-200"
        };
      case "info":
        return {
          icon: "text-blue-500",
          button: "bg-blue-600 hover:bg-blue-700",
          border: "border-blue-200"
        };
      default:
        return {
          icon: "text-yellow-500",
          button: "bg-yellow-600 hover:bg-yellow-700",
          border: "border-yellow-200"
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirmClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[99999] p-2 sm:p-4"
      style={{ 
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        pointerEvents: 'auto'
      }}
    >
      <div 
        className={`max-w-md w-full mx-2 sm:mx-0 rounded-lg shadow-2xl overflow-hidden transform transition-all ${
          currentMode === "Dark" ? "bg-gray-800" : "bg-white"
        }`}
        onClick={handleModalContentClick}
        onTouchStart={handleModalContentClick}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          currentMode === "Dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <MdWarning className={`text-2xl ${styles.icon}`} />
            <h3 className={`text-lg font-semibold ${
              currentMode === "Dark" ? "text-white" : "text-gray-900"
            }`}>
              {title}
            </h3>
          </div>
          <button
            onClick={handleCancelClick}
            disabled={loading}
            className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              currentMode === "Dark" ? "text-gray-400" : "text-gray-600"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ touchAction: 'manipulation' }}
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-sm leading-relaxed ${
            currentMode === "Dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 border-t ${
          currentMode === "Dark" ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
        }`}>
          <button
            onClick={handleCancelClick}
            disabled={loading}
            type="button"
            className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg border transition-colors text-center ${
              currentMode === "Dark"
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ touchAction: 'manipulation' }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={loading}
            type="button"
            className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${styles.button} ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
