import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react"; // Optional icon
import { useCategoryStore } from "../../../stores/useCategoryStore";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";

const CreateCategoryForm = () => {
  const { createCategory, loading } = useCategoryStore();
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
    parentCategory: "",
    status: "active",
    sortOrder: "",
    metaTitle: "",
    metaDescription: "",
  });
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("slug", newCategory.slug);
    formData.append("description", newCategory.description);
    if (newCategory.image) formData.append("image", newCategory.image);
    formData.append("parentCategory", newCategory.parentCategory);
    formData.append("status", newCategory.status);
    formData.append("sortOrder", newCategory.sortOrder);
    formData.append("metaTitle", newCategory.metaTitle);
    formData.append("metaDescription", newCategory.metaDescription);

    await createCategory(formData);
    setNewCategory({
      name: "",
      slug: "",
      description: "",
      image: null,
      parentCategory: "",
      status: "active",
      sortOrder: "",
      metaTitle: "",
      metaDescription: "",
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
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300"
          >
            Category Name
          </label>
          <input
            type="text"
            id="name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-300"
          >
            Slug
          </label>
          <input
            type="text"
            id="slug"
            value={newCategory.slug}
            onChange={(e) =>
              setNewCategory({ ...newCategory, slug: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Parent Category */}
        <div>
          <label
            htmlFor="parentCategory"
            className="block text-sm font-medium text-gray-300"
          >
            Parent Category
          </label>
          <input
            type="text"
            id="parentCategory"
            value={newCategory.parentCategory}
            onChange={(e) =>
              setNewCategory({ ...newCategory, parentCategory: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Image */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-300"
          >
            Upload Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                image: e.target.files?.[0] || null,
              })
            }
            className="block w-full text-sm text-gray-300 border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-300"
          >
            Status
          </label>
          <select
            id="status"
            value={newCategory.status}
            onChange={(e) =>
              setNewCategory({ ...newCategory, status: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label
            htmlFor="sortOrder"
            className="block text-sm font-medium text-gray-300"
          >
            Sort Order
          </label>
          <input
            type="number"
            id="sortOrder"
            value={newCategory.sortOrder}
            onChange={(e) =>
              setNewCategory({ ...newCategory, sortOrder: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Meta Title */}
        <div>
          <label
            htmlFor="metaTitle"
            className="block text-sm font-medium text-gray-300"
          >
            Meta Title
          </label>
          <input
            type="text"
            id="metaTitle"
            value={newCategory.metaTitle}
            onChange={(e) =>
              setNewCategory({ ...newCategory, metaTitle: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Meta Description */}
        <div>
          <label
            htmlFor="metaDescription"
            className="block text-sm font-medium text-gray-300"
          >
            Meta Description
          </label>
          <textarea
            id="metaDescription"
            rows={3}
            value={newCategory.metaDescription}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                metaDescription: e.target.value,
              })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

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
