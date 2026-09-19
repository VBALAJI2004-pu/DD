import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import useExpenseStore from "../Store/ExpenseStore";
import axiosInstance from "../Library/Axios";
import { toast } from "react-toastify";
import { ConfirmationModal } from "../components";

const ManageCategories = () => {
  const { categories, categorySubMap, getExpenseCategories } = useExpenseStore();
  const [localCategories, setLocalCategories] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubCategory, setShowAddSubCategory] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    onConfirm: null,
    loading: false
  });

  useEffect(() => {
    getExpenseCategories();
  }, [getExpenseCategories]);

  useEffect(() => {
    if (categorySubMap) {
      setLocalCategories(categorySubMap);
    }
  }, [categorySubMap]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddCategory = async () => {
    console.log('🔵 handleAddCategory called with:', newCategoryName);
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (localCategories[newCategoryName]) {
      toast.error("Category already exists");
      return;
    }

    try {
      console.log('🔵 Making API call to add category:', newCategoryName);
      // API call to add category
      const response = await axiosInstance.post('/categories', {
        categoryName: newCategoryName
      });

      setLocalCategories(prev => ({
        ...prev,
        [newCategoryName]: []
      }));
      setNewCategoryName("");
      setShowAddCategory(false);
      toast.success("Category added successfully");
      getExpenseCategories(); // Refresh data
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to add category");
    }
  };

  const handleSaveCategory = async (oldCategoryName) => {
    const newName = document.querySelector(`input[value="${oldCategoryName}"]`)?.value?.trim();
    if (!newName || newName === oldCategoryName) {
      setEditingCategory(null);
      return;
    }

    if (localCategories[newName]) {
      toast.error("Category already exists");
      return;
    }

    try {
      await axiosInstance.put(`/categories/${encodeURIComponent(oldCategoryName)}`, {
        newCategoryName: newName
      });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      getExpenseCategories();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleSaveSubCategory = async (categoryName, oldSubCategoryName) => {
    const newName = document.querySelector(`input[value="${oldSubCategoryName}"]`)?.value?.trim();
    if (!newName || newName === oldSubCategoryName) {
      setEditingSubCategory(null);
      return;
    }

    if (localCategories[categoryName]?.includes(newName)) {
      toast.error("Subcategory already exists");
      return;
    }

    try {
      await axiosInstance.put(`/categories/subcategories/${encodeURIComponent(categoryName)}/${encodeURIComponent(oldSubCategoryName)}`, {
        newSubCategoryName: newName
      });
      toast.success('Subcategory updated successfully');
      setEditingSubCategory(null);
      getExpenseCategories();
    } catch (error) {
      toast.error('Failed to update subcategory');
    }
  };

  const handleDeleteCategory = (categoryName) => {
    setConfirmModal({
      isOpen: true,
      type: "danger",
      title: "Delete Category",
      message: `Are you sure you want to delete "${categoryName}" and all its subcategories? This action cannot be undone.`,
      onConfirm: () => confirmDeleteCategory(categoryName),
      loading: false
    });
  };

  const confirmDeleteCategory = async (categoryName) => {
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      await axiosInstance.delete(`/categories/${encodeURIComponent(categoryName)}`);
      toast.success('Category deleted successfully');
      getExpenseCategories();
      setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false });
    } catch (error) {
      toast.error('Failed to delete category');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditCategory = async (oldName, newName) => {
    if (!newName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (oldName !== newName && localCategories[newName]) {
      toast.error("Category already exists");
      return;
    }

    try {
      await axiosInstance.put(`/categories/${encodeURIComponent(oldName)}`, {
        newCategoryName: newName
      });

      const newCategories = { ...localCategories };
      newCategories[newName] = newCategories[oldName];
      if (oldName !== newName) {
        delete newCategories[oldName];
      }
      setLocalCategories(newCategories);
      setEditingCategory(null);
      toast.success("Category updated successfully");
      getExpenseCategories(); // Refresh data
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update category");
    }
  };

  const handleAddSubCategory = async (categoryName) => {
    if (!newSubCategoryName.trim()) {
      toast.error("Subcategory name cannot be empty");
      return;
    }

    if (localCategories[categoryName]?.includes(newSubCategoryName)) {
      toast.error("Subcategory already exists");
      return;
    }

    try {
      await axiosInstance.post('/categories/subcategories', {
        categoryName, 
        subCategoryName: newSubCategoryName 
      });

      setLocalCategories(prev => ({
        ...prev,
        [categoryName]: [...(prev[categoryName] || []), newSubCategoryName]
      }));
      setNewSubCategoryName("");
      setShowAddSubCategory(null);
      toast.success("Subcategory added successfully");
      getExpenseCategories(); // Refresh data
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to add subcategory");
    }
  };

  const handleDeleteSubCategory = (categoryName, subCategoryName) => {
    setConfirmModal({
      isOpen: true,
      type: "danger",
      title: "Delete Subcategory",
      message: `Are you sure you want to delete "${subCategoryName}" from "${categoryName}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteSubCategory(categoryName, subCategoryName),
      loading: false
    });
  };

  const confirmDeleteSubCategory = async (categoryName, subCategoryName) => {
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      await axiosInstance.delete(`/categories/subcategories/${encodeURIComponent(categoryName)}/${encodeURIComponent(subCategoryName)}`);
      toast.success('Subcategory deleted successfully');
      getExpenseCategories();
      setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false });
    } catch (error) {
      toast.error('Failed to delete subcategory');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditSubCategory = async (categoryName, oldSubName, newSubName) => {
    if (!newSubName.trim()) {
      toast.error("Subcategory name cannot be empty");
      return;
    }

    if (oldSubName !== newSubName && localCategories[categoryName]?.includes(newSubName)) {
      toast.error("Subcategory already exists");
      return;
    }

    try {
      await axiosInstance.put(`/categories/subcategories/${encodeURIComponent(categoryName)}/${encodeURIComponent(oldSubName)}`, {
        newSubCategoryName: newSubName
      });

      setLocalCategories(prev => ({
        ...prev,
        [categoryName]: prev[categoryName].map(sub => 
          sub === oldSubName ? newSubName : sub
        )
      }));
      setEditingSubCategory(null);
      toast.success("Subcategory updated successfully");
      getExpenseCategories(); // Refresh data
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update subcategory");
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl dark:bg-secondary-dark-bg">
      <div className="mb-10">
        <p className="text-lg text-gray-400">Management</p>
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-200">
          Expense Categories
        </p>
      </div>
      <div className="bg-white dark:bg-secondary-dark-bg rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BiCategory className="text-xl text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Expense Categories
              </h2>
            </div>
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FiPlus className="text-sm" />
              Add Category
            </button>
          </div>
        </div>

        {/* Add New Category Form */}
        {showAddCategory && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FiSave className="text-sm" />
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(localCategories).length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <BiCategory className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No categories found. Add your first category!</p>
            </div>
          ) : (
            Object.entries(localCategories).map(([categoryName, subCategories]) => (
              <div key={categoryName} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                {/* Category Header */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {expandedCategories[categoryName] ? (
                        <MdExpandLess className="text-gray-600 dark:text-gray-400" />
                      ) : (
                        <MdExpandMore className="text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    {editingCategory === categoryName ? (
                      <input
                        type="text"
                        defaultValue={categoryName}
                        onBlur={(e) => handleEditCategory(categoryName, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditCategory(categoryName, e.target.value);
                          }
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-800 dark:text-white text-sm">
                        {categoryName}
                      </span>
                    )}
                    
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {subCategories?.length || 0} items
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {editingCategory === categoryName ? (
                      <button
                        onClick={() => handleSaveCategory(categoryName)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                      >
                        <FiSave className="text-sm" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingCategory(categoryName)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCategory(categoryName)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories[categoryName] && (
                  <div className="bg-gray-50 dark:bg-gray-800/30">
                    {/* Add Subcategory Form */}
                    {showAddSubCategory === categoryName && (
                      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 ml-8">
                          <input
                            type="text"
                            value={newSubCategoryName}
                            onChange={(e) => setNewSubCategoryName(e.target.value)}
                            placeholder="Enter subcategory name"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSubCategory(categoryName)}
                          />
                          <button
                            onClick={() => handleAddSubCategory(categoryName)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <FiSave className="text-sm" />
                          </button>
                          <button
                            onClick={() => {
                              setShowAddSubCategory(null);
                              setNewSubCategoryName("");
                            }}
                            className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Subcategories List */}
                    {subCategories?.map((subCategory) => (
                      <div key={subCategory} className="flex items-center justify-between p-2 ml-8 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                        {editingSubCategory === `${categoryName}-${subCategory}` ? (
                          <input
                            type="text"
                            defaultValue={subCategory}
                            onBlur={(e) => handleEditSubCategory(categoryName, subCategory, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditSubCategory(categoryName, subCategory, e.target.value);
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            • {subCategory}
                          </span>
                        )}
                        
                        <div className="flex items-center gap-1">
                          {editingSubCategory === `${categoryName}-${subCategory}` ? (
                            <button
                              onClick={() => handleSaveSubCategory(categoryName, subCategory)}
                              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                            >
                              <FiSave className="text-xs" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingSubCategory(`${categoryName}-${subCategory}`)}
                              className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                            >
                              <FiEdit2 className="text-xs" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSubCategory(categoryName, subCategory)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Subcategory Button */}
                    <div className="p-2 ml-8">
                      <button
                        onClick={() => setShowAddSubCategory(categoryName)}
                        className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors text-sm"
                      >
                        <FiPlus className="text-xs" />
                        Add Subcategory
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={confirmModal.loading}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ManageCategories;
