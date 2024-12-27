import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react"; // Optional icon
import { useCategoryStore } from "../../../stores/useCategoryStore";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import InputField from "../../shared/InputField/InputField";
import { debounce } from "lodash"; // If lodash is available

const initialCategoryState = {
  name: "",
  slug: "",
  description: "",
  image: null,
  parentCategory: "",
  status: "active",
  sortOrder: "",
  metaTitle: "",
  metaDescription: "",
};

const CreateCategoryForm = () => {
  const { createCategory, loading, getParentCategories, categories } =
    useCategoryStore(); // Assuming categories are available
  const [newCategory, setNewCategory] = useState(initialCategoryState);
  const [categoryType, setCategoryType] = useState("parent"); // To track category type (parent or child)

  const inputFields = [
    {
      id: "name",
      label: "Category Name",
      type: "text",
      value: newCategory.name,
      placeholder: "Enter category name",
      required: true,
    },
    {
      id: "slug",
      label: "Slug",
      type: "text",
      value: newCategory.slug,
      placeholder: "Enter slug (e.g., category-name)",
      required: true,
    },
    {
      id: "description",
      label: "Description",
      type: "textarea",
      value: newCategory.description,
      placeholder: "Enter category description",
      rows: 3,
    },
    {
      id: "image",
      label: "Upload Image",
      type: "file",
      accept: "image/*",
      placeholder: "Choose a category image",
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      value: newCategory.status,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      placeholder: "Select category status",
    },
    {
      id: "sortOrder",
      label: "Sort Order",
      type: "number",
      value: newCategory.sortOrder,
      placeholder: "Enter sorting order (e.g., 1, 2, 3)",
    },
    {
      id: "metaTitle",
      label: "Meta Title",
      type: "text",
      value: newCategory.metaTitle,
      placeholder: "Enter meta title for SEO",
    },
    {
      id: "metaDescription",
      label: "Meta Description",
      type: "textarea",
      value: newCategory.metaDescription,
      placeholder: "Enter meta description for SEO",
      rows: 3,
    },
  ];
  useEffect(() => {
    getParentCategories();
  }, [getParentCategories]);

  // UseMemo for constant data
  const selctCategory = useMemo(
    () =>
      categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categories]
  );

  // Optimize the handle input change function with useCallback
  const handleInputChange = useCallback((key, value) => {
    setNewCategory((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(newCategory).forEach((key) => {
      if (key === "image" && newCategory.image) {
        formData.append(key, newCategory.image);
      } else {
        formData.append(key, newCategory[key]);
      }
    });

    const data = await createCategory(formData);
    console.log("Created category: ", data);
    setNewCategory(initialCategoryState);
  };

  const handleCategoryTypeChange = (e) => {
    const { value } = e.target;
    console.log("Category Type: ", value);
    setCategoryType(value);
    setNewCategory((prev) => ({
      ...prev,
      parentCategory: value === "child" ? "" : prev.parentCategory,
    }));
  };

  const handleParentCategoryChange = (e) => {
    const selectedParentCategory = e.target.value;
    console.log(" Category Selected: ", selectedParentCategory);
    handleInputChange("parentCategory", selectedParentCategory);
  };

  return (
    <motion.div
      className="bg-gray-800 w-full p-6 rounded-lg md:max-w-xl lg:max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Category
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category Type
          </label>
          <div className="mt-2 flex space-x-4">
            <label>
              <input
                type="radio"
                name="categoryType"
                value="parent"
                checked={categoryType === "parent"}
                onChange={handleCategoryTypeChange}
              />
              Parent Category
            </label>
            <label>
              <input
                type="radio"
                name="categoryType"
                value="child"
                checked={categoryType === "child"}
                onChange={handleCategoryTypeChange}
              />
              Child Category
            </label>
          </div>
        </div>

        {/* Parent Category Dropdown (only if creating a child category) */}
        {categoryType === "child" && (
          <div className="mb-4">
            <InputField
              type="select"
              label="Parent Category"
              id="parentCategory"
              value={newCategory.parentCategory}
              options={selctCategory}
              onChange={(e) => handleParentCategoryChange(e)}
            />
          </div>
        )}

        {/* Render input fields dynamically */}
        {inputFields.map((field) => (
          <InputField
            key={field.id}
            placeholder={field.placeholder}
            {...field}
            onChange={(e) =>
              handleInputChange(
                field.id,
                field.type === "file" ? e.target.files[0] : e.target.value
              )
            }
          />
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Category
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateCategoryForm;
