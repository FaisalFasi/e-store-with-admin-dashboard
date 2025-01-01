import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react"; // Optional icon
import { useCategoryStore } from "../../../stores/useCategoryStore";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import InputField from "../../shared/InputField/InputField";
import toast from "react-hot-toast";

const initialCategoryState = {
  name: "",
  slug: "",
  description: "",
  image: null,
  categoryType: "parent", // Default to parent category
  parentCategory: "parent", // Empty initially, only used if categoryType is "child"
  status: "active",
  sortOrder: "0",
  metaTitle: "",
  metaDescription: "",
};

const CreateCategoryForm = () => {
  const { createCategory, loading, getParentCategories, categories } =
    useCategoryStore(); // Assuming categories are available
  const [newCategory, setNewCategory] = useState(initialCategoryState);

  const inputFields = [
    {
      name: "name",
      label: `${
        newCategory.categoryType === "child" ? "Sub" : ""
      } Category Name`,
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

  useEffect(() => {
    getParentCategories();
  }, []);

  // UseMemo for constant data
  const selctCategory = useMemo(
    () =>
      categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categories]
  );

  const handleParentCategoryChange = (e) => {
    const selectedParentCategory = e.target.value;
    handleInputChange("parentCategory", selectedParentCategory);
    console.log(" Category Selected: ", selectedParentCategory);
  };

  // Optimize the handle input change function with useCallback
  const handleInputChange = (key, value) => {
    console.log("Key: ", key, "Value: ", value);
    setNewCategory((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    Object.keys(newCategory).forEach((key) => {
      if (
        // add validation for the image field
        !newCategory[key] ||
        newCategory[key].toString().trim() === ""
      ) {
        missingFields.push(key);
      }
    });

    if (missingFields.length > 0) {
      return toast.error(`Missing fields: ${missingFields.join(", ")}`);
    }

    const formData = new FormData(e.target);
    const imageFile = formData.get("image");

    console.log("imageFile: ", imageFile);

    if (imageFile && imageFile.size > 0) {
      try {
        const base64String = await convertImageToBase64(imageFile);
        console.log("Base64 String: ", base64String);
        formData.set("image", base64String); // Add the Base64 string to the form data
      } catch (error) {
        console.log("Error converting image to Base64: ", error.message);
        return toast.error("Failed to convert image to Base64");
      }
    } else {
      return toast.error("Please select an image");
    }

    const dataObject = Object.fromEntries(formData);

    console.log("Data Object after ---: ", dataObject);

    const data = await createCategory(dataObject);
    console.log("Created category: ", data);
    if (data) setNewCategory(initialCategoryState);
  };
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
                checked={newCategory.categoryType === "parent"}
                onChange={(e) =>
                  handleInputChange("categoryType", e.target.value)
                }
                // onChange={() => handleInputChange("parent")}
              />
              Parent Category
            </label>
            <label>
              <input
                type="radio"
                name="categoryType"
                value="child"
                // checked  is used to set the default value
                checked={newCategory.categoryType === "child"} // here !! converts the value to boolean
                onChange={(e) =>
                  handleInputChange("categoryType", e.target.value)
                }
                // onChange={() => handleInputChange("child")}
              />
              Child Category
            </label>
          </div>
        </div>

        {/* Parent Category Dropdown (only if creating a child category) */}
        {newCategory.categoryType === "child" && (
          <div className="mb-4">
            <InputField
              type="select"
              label="Parent Category"
              name="parentCategory"
              value={newCategory.parentCategory}
              options={selctCategory}
              onChange={handleParentCategoryChange}
            />
          </div>
        )}

        {/* Render input fields dynamically */}
        {inputFields.map((field) => (
          <InputField
            key={field.name}
            placeholder={field.placeholder}
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