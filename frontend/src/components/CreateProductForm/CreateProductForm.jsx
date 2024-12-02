import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";

const categories = [
  "jeans",
  "t-shirts",
  "shoes",
  "glasses",
  "jackets",
  "suits",
  "bags",
];

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [], // Update to handle multiple images
  });

  const { createProduct, loading } = useProductStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        images: [],
      });
    } catch {
      console.log("Error creating a product");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = [];

    files.forEach((file) => {
      // Check if file type is an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          validImages.push(reader.result);
          // Update state after all images are processed
          if (validImages.length === files.length) {
            setNewProduct((prev) => ({
              ...prev,
              images: [...prev.images, ...validImages],
            }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert(`${file.name} is not a valid image file`);
      }
    });
  };

  const removeImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-4 md:p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product name, description, price, and category fields (same as your code) */}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						 px-3 text-white focus:outline-none focus:ring-2
						focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
						 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-300"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min={0}
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            step="0.01"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
						 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md
						 shadow-sm py-2 px-3 text-white focus:outline-none
						 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="images"
            className="block text-sm font-medium text-gray-300"
          >
            Upload Images
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-300 border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <div className="mt-3 flex flex-wrap gap-4">
            {newProduct.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Uploaded ${index}`}
                  className="h-20 w-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { PlusCircle, Upload, Loader } from "lucide-react";
// import { useProductStore } from "../../stores/useProductStore";

// const categories = [
//   "jeans",
//   "t-shirts",
//   "shoes",
//   "glasses",
//   "jackets",
//   "suits",
//   "bags",
// ];

// const CreateProductForm = () => {
//   const [newProduct, setNewProduct] = useState({
//     name: "",
//     description: "",
//     price: "",
//     category: "",
//     image: [],
//   });

//   const { createProduct, loading } = useProductStore();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await createProduct(newProduct);
//       setNewProduct({
//         name: "",
//         description: "",
//         price: "",
//         category: "",
//         image: [],
//       });
//     } catch {
//       console.log("error creating a product");
//     }
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
//     const imagePromises = [];

//     for (const file of files) {
//       if (!allowedTypes.includes(file.type)) {
//         alert(
//           `Invalid file type: ${file.name}. Please upload PNG, JPEG, or PDF files.`
//         );
//         return; // Exit early if any file is invalid
//       }

//       imagePromises.push(
//         new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.onloadend = () => resolve(reader.result);
//           reader.onerror = reject;
//           reader.readAsDataURL(file);
//         })
//       );
//     }

//     Promise.all(imagePromises)
//       .then((base64Images) => {
//         setNewProduct((prevProduct) => ({
//           ...prevProduct,
//           images: [...prevProduct.images, ...base64Images],
//         }));
//       })
//       .catch((err) => console.error("Error uploading images", err));
//   };

//   // const handleImageChange = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     const reader = new FileReader();

//   //     reader.onloadend = () => {
//   //       setNewProduct({ ...newProduct, image: reader.result });
//   //     };

//   //     // here readasDataURL is used to convert the image to base64 which is a string representation of the image
//   //     reader.readAsDataURL(file); // base64
//   //   }
//   // };

//   return (
//     <motion.div
//       className="bg-gray-800 shadow-lg rounded-lg p-4 md:p-8 mb-8 max-w-xl mx-auto"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//     >
//       <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
//         Create New Product
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label
//             htmlFor="name"
//             className="block text-sm font-medium text-gray-300"
//           >
//             Product Name
//           </label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={newProduct.name}
//             onChange={(e) =>
//               setNewProduct({ ...newProduct, name: e.target.value })
//             }
//             className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
// 						 px-3 text-white focus:outline-none focus:ring-2
// 						focus:ring-emerald-500 focus:border-emerald-500"
//             required
//           />
//         </div>

//         <div>
//           <label
//             htmlFor="description"
//             className="block text-sm font-medium text-gray-300"
//           >
//             Description
//           </label>
//           <textarea
//             id="description"
//             name="description"
//             value={newProduct.description}
//             onChange={(e) =>
//               setNewProduct({ ...newProduct, description: e.target.value })
//             }
//             rows="3"
//             className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
// 						 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
// 						 focus:border-emerald-500"
//             required
//           />
//         </div>

//         <div>
//           <label
//             htmlFor="price"
//             className="block text-sm font-medium text-gray-300"
//           >
//             Price
//           </label>
//           <input
//             type="number"
//             id="price"
//             name="price"
//             min={0}
//             value={newProduct.price}
//             onChange={(e) =>
//               setNewProduct({ ...newProduct, price: e.target.value })
//             }
//             step="0.01"
//             className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
// 						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
// 						 focus:border-emerald-500"
//             required
//           />
//         </div>

//         <div>
//           <label
//             htmlFor="category"
//             className="block text-sm font-medium text-gray-300"
//           >
//             Category
//           </label>
//           <select
//             id="category"
//             name="category"
//             value={newProduct.category}
//             onChange={(e) =>
//               setNewProduct({ ...newProduct, category: e.target.value })
//             }
//             className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md
// 						 shadow-sm py-2 px-3 text-white focus:outline-none
// 						 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//             required
//           >
//             <option value="">Select a category</option>
//             {categories.map((category) => (
//               <option key={category} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="mt-1 flex items-center">
//           <input
//             type="file"
//             id="image"
//             className="sr-only"
//             accept="image/*,image/webp"
//             onChange={handleImageChange}
//           />
//           <label
//             htmlFor="image"
//             className="cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
//           >
//             <Upload className="h-5 w-5 inline-block mr-2" />
//             Upload Image
//           </label>
//           {newProduct.image != [] ? (
//             <span className="ml-3 text-sm text-green-400">Image uploaded </span>
//           ) : (
//             <span className="ml-3 text-sm text-gray-400">
//               Please upload an image
//             </span>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
// 					shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700
// 					focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
//           disabled={loading}
//         >
//           {loading ? (
//             <>
//               <Loader
//                 className="mr-2 h-5 w-5 animate-spin"
//                 aria-hidden="true"
//               />
//               Loading...
//             </>
//           ) : (
//             <>
//               <PlusCircle className="mr-2 h-5 w-5" />
//               Create Product
//             </>
//           )}
//         </button>
//       </form>
//     </motion.div>
//   );
// };
// export default CreateProductForm;
