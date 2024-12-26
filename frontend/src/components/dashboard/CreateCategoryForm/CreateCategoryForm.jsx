import React, { useState } from "react";
import { useCategoryStore } from "../../../stores/useCategoryStore";

const CreateCategoryForm = () => {
  const { createCategory, loading } = useCategoryStore();
  const [categoryData, setCategoryData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentCategory: "",
    status: "",
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
  });

  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCategory(categoryData);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setCategoryData({
      name: "",
      slug: "",
      description: "",
      image: "",
      parentCategory: "",
      status: "",
      sortOrder: 0,
      metaTitle: "",
      metaDescription: "",
    });
  };

  // Reusable input component
  const InputField = ({
    id,
    label,
    type = "text",
    name,
    value,
    placeholder,
    required = false,
  }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        required={required}
        className="w-full px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
        placeholder={placeholder}
      />
    </div>
  );

  // Reusable textarea component
  const TextAreaField = ({ id, label, name, value, placeholder }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={handleInputChange}
        rows={3}
        className="w-full px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
        placeholder={placeholder}
      ></textarea>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">
        Create Category
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        <InputField
          id="name"
          label="Name"
          name="name"
          value={categoryData.name}
          placeholder="Enter category name"
          required
        />
        <InputField
          id="slug"
          label="Slug"
          name="slug"
          value={categoryData.slug}
          placeholder="Enter category slug"
          required
        />
        <TextAreaField
          id="description"
          label="Description"
          name="description"
          value={categoryData.description}
          placeholder="Enter category description"
        />
        <InputField
          id="image"
          label="Image URL"
          name="image"
          value={categoryData.image}
          placeholder="Enter image URL"
        />
        <InputField
          id="parentCategory"
          label="Parent Category"
          name="parentCategory"
          value={categoryData.parentCategory}
          placeholder="Enter parent category ID (optional)"
        />
        <InputField
          id="status"
          label="Status"
          name="status"
          value={categoryData.status}
          placeholder="Enter status (e.g., active/inactive)"
        />
        <InputField
          id="sortOrder"
          label="Sort Order"
          type="number"
          name="sortOrder"
          value={categoryData.sortOrder}
          placeholder="Enter sort order"
        />
        <InputField
          id="metaTitle"
          label="Meta Title"
          name="metaTitle"
          value={categoryData.metaTitle}
          placeholder="Enter meta title"
        />
        <TextAreaField
          id="metaDescription"
          label="Meta Description"
          name="metaDescription"
          value={categoryData.metaDescription}
          placeholder="Enter meta description"
        />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryForm;

// import React, { useState } from "react";

// const CreateCategoryForm = () => {
//   const [categoryName, setCategoryName] = useState("");
//   const [description, setDescription] = useState("");
//   const [image, setImage] = useState("");
//   const [slug, setSlug] = useState("");

//   const handleCategorySubmit = (e) => {
//     e.preventDefault();
//     // Handle the category creation logic here
//     // Call your backend API to create the category
//     console.log("Category Created:", {
//       categoryName,
//       description,
//       image,
//       slug,
//     });
//   };

//   return (
//     <form onSubmit={handleCategorySubmit} className="space-y-6">
//       <div className="flex flex-col space-y-2">
//         <label htmlFor="categoryName" className="text-white">
//           Category Name
//         </label>
//         <input
//           type="text"
//           id="categoryName"
//           value={categoryName}
//           onChange={(e) => setCategoryName(e.target.value)}
//           className="p-2 rounded-md bg-gray-700 text-white"
//           required
//         />
//       </div>

//       <div className="flex flex-col space-y-2">
//         <label htmlFor="description" className="text-white">
//           Description
//         </label>
//         <textarea
//           id="description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className="p-2 rounded-md bg-gray-700 text-white"
//           required
//         />
//       </div>

//       <div className="flex flex-col space-y-2">
//         <label htmlFor="image" className="text-white">
//           Image URL
//         </label>
//         <input
//           type="url"
//           id="image"
//           value={image}
//           onChange={(e) => setImage(e.target.value)}
//           className="p-2 rounded-md bg-gray-700 text-white"
//           required
//         />
//       </div>

//       <div className="flex flex-col space-y-2">
//         <label htmlFor="slug" className="text-white">
//           Slug
//         </label>
//         <input
//           type="text"
//           id="slug"
//           value={slug}
//           onChange={(e) => setSlug(e.target.value)}
//           className="p-2 rounded-md bg-gray-700 text-white"
//           required
//         />
//       </div>

//       <button
//         type="submit"
//         className="w-full py-3 mt-4 text-white bg-emerald-600 rounded-md"
//       >
//         Create Category
//       </button>
//     </form>
//   );
// };

// export default CreateCategoryForm;
