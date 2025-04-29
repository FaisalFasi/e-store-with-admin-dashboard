"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useCategoryStore } from "../../../stores/useCategoryStore";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import InputField from "../../shared/InputField/InputField";
import toast from "react-hot-toast";
import {
  validateImages,
  removeImageFromList,
} from "../../../utils/imageValidation/imageValidation.js";

const initialCategoryState = {
  name: "",
  slug: "",
  description: "",
  image: null,
  depth: 0, // 0=L1, 1=L2, 2=L3, 3=L4
  parentCategory: null, // Parent category ID
  status: "active",
  sortOrder: 0,
  metaTitle: "",
  metaDescription: "",
};

const CreateCategoryForm = () => {
  const { createCategory, loading, categories, getAllCategories } =
    useCategoryStore();
  const [newCategory, setNewCategory] = useState(initialCategoryState);
  const [availableParents, setAvailableParents] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  // Update available parents when depth changes
  useEffect(() => {
    if (newCategory.depth === 0) {
      // L1 categories don't have parents
      setAvailableParents([]);
    } else {
      // Filter categories that can be parents for the current depth
      const parentDepth = newCategory.depth - 1;
      const possibleParents = categories.filter(
        (cat) => cat.depth === parentDepth && cat.status === "active"
      );
      setAvailableParents(possibleParents);
    }
  }, [newCategory.depth, categories]);

  // Generate slug from name
  useEffect(() => {
    if (newCategory.name) {
      const slug = newCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setNewCategory((prev) => ({ ...prev, slug }));
    }
  }, [newCategory.name]);

  const handleInputChange = (key, value) => {
    if (key === "image") {
      const validatedImages = validateImages([value]);
      setNewCategory((prev) => ({
        ...prev,
        image: validatedImages[0],
      }));
    } else if (key === "depth") {
      // When depth changes, reset parent category
      setNewCategory((prev) => ({
        ...prev,
        [key]: Number.parseInt(value),
        parentCategory: null,
      }));
    } else {
      setNewCategory((prev) => ({ ...prev, [key]: value }));
    }
  };

  const removeImage = (index) => {
    const updateImages = removeImageFromList([newCategory.image], index);
    setNewCategory((prev) => ({
      ...prev,
      image: updateImages[0] || null,
    }));
    if (!updateImages[0]) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newCategory.name || !newCategory.slug) {
      return toast.error("Name and slug are required");
    }

    // Validate parent category for non-L1 categories
    if (newCategory.depth > 0 && !newCategory.parentCategory) {
      return toast.error("Parent category is required for sub-categories");
    }

    const formData = new FormData();

    // Append all category fields to formData
    Object.keys(newCategory).forEach((key) => {
      if (key === "image" && newCategory.image) {
        // Handle image file
        if (typeof newCategory.image === "string") {
          // If it's a URL string (for existing images)
          formData.append("imageUrl", newCategory.image);
        } else {
          // If it's a File object
          formData.append("image", newCategory.image);
        }
      } else if (newCategory[key] !== null && newCategory[key] !== undefined) {
        formData.append(key, newCategory[key]);
      }
    });

    const data = await createCategory(formData);
    if (data) {
      setNewCategory(initialCategoryState);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Get depth label
  const getDepthLabel = (depth) => {
    switch (depth) {
      case 0:
        return "Main Category (L1)";
      case 1:
        return "Sub-Category (L2)";
      case 2:
        return "Sub-Sub-Category (L3)";
      case 3:
        return "Final Category (L4)";
      default:
        return "Category";
    }
  };

  // Dynamic input fields
  const inputFields = [
    {
      name: "name",
      label: `${getDepthLabel(newCategory.depth)} Name`,
      type: "text",
      value: newCategory.name,
      placeholder: "Enter category name",
      required: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      value: newCategory.slug,
      placeholder: "Enter slug (e.g., category-name)",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      value: newCategory.description,
      placeholder: "Enter category description",
      rows: 3,
    },
    {
      name: "image",
      label: "Upload Image",
      type: "file",
      accept: "image/*",
      placeholder: "Choose a category image",
    },
    {
      name: "status",
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
      name: "sortOrder",
      label: "Sort Order",
      type: "number",
      value: newCategory.sortOrder,
      placeholder: "Enter sorting order (e.g., 1, 2, 3)",
    },
    {
      name: "metaTitle",
      label: "Meta Title",
      type: "text",
      value: newCategory.metaTitle,
      placeholder: "Enter meta title for SEO",
    },
    {
      name: "metaDescription",
      label: "Meta Description",
      type: "textarea",
      value: newCategory.metaDescription,
      placeholder: "Enter meta description for SEO",
      rows: 3,
    },
  ];

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
        {/* Category Depth Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${
                newCategory.depth === 0
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => handleInputChange("depth", 0)}
            >
              Main Category (L1)
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${
                newCategory.depth === 1
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => handleInputChange("depth", 1)}
            >
              Sub-Category (L2)
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${
                newCategory.depth === 2
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => handleInputChange("depth", 2)}
            >
              Sub-Sub-Category (L3)
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${
                newCategory.depth === 3
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => handleInputChange("depth", 3)}
            >
              Final Category (L4)
            </button>
          </div>
        </div>

        {/* Parent Category Dropdown (only if not L1) */}
        {newCategory.depth > 0 && (
          <div className="mb-4">
            <InputField
              type="select"
              label={`Select Parent ${getDepthLabel(newCategory.depth - 1)}`}
              name="parentCategory"
              value={newCategory.parentCategory || ""}
              options={availableParents.map((cat) => ({
                value: cat._id,
                label: cat.name,
              }))}
              onChange={(e) =>
                handleInputChange("parentCategory", e.target.value)
              }
              placeholder={`Select parent ${
                newCategory.depth === 1 ? "category" : "sub-category"
              }`}
              required
            />
            {availableParents.length === 0 && (
              <p className="text-yellow-500 text-sm mt-1">
                No parent categories available. Please create a{" "}
                {getDepthLabel(newCategory.depth - 1)} first.
              </p>
            )}
          </div>
        )}

        {/* Render input fields dynamically */}
        {inputFields.map((field) => (
          <InputField
            key={field.name}
            placeholder={field.placeholder}
            multiple={false}
            fileInputRef={fileInputRef}
            handleImageRemove={removeImage}
            selectedImages={newCategory.image ? [newCategory.image] : []}
            {...field}
            onChange={(e) =>
              handleInputChange(
                field.name,
                field.type === "file" ? e.target.files[0] : e.target.value
              )
            }
          />
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={
            loading || (newCategory.depth > 0 && availableParents.length === 0)
          }
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create {getDepthLabel(newCategory.depth)}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateCategoryForm;
