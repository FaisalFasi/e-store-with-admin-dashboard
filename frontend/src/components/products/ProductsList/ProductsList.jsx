import React from "react";
import { useProductStore } from "../../../stores/useProductStore";
import { Trash, Star } from "lucide-react";
import { motion } from "framer-motion";
import CustomTooltip from "../../shared/CustomTooltip/CustomTooltip";

const ProductsList = () => {
  const { deleteProduct, products, toggleFeaturedProduct } = useProductStore();

  console.log("products--:", products);

  return (
    <motion.div
      className="p-0 bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Scrollable container for large screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="hidden md:block px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Featured
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {products?.map((product, index) => (
              <tr key={index} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        className="h-10 w-10 object-cover"
                        src={product?.variations[0].colors[0].imageUrls[0]}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4 overflow-hidden whitespace-nowrap max-w-[15ch]">
                      {product.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-300 text-sm">
                    $
                    {product.variations[0]?.colors[0]?.sizes[0].price.toFixed(
                      2
                    ) || "N/A"}{" "}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-300 text-sm">
                    {product.category?.grandchild?.name ||
                      product.category?.child?.name ||
                      product.category?.parent?.name}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleFeaturedProduct(product._id)}
                    className={`p-2 rounded-full ${
                      product.isFeatured
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-600 text-gray-300"
                    } hover:bg-yellow-500 transition-colors duration-200`}
                  >
                    <Star className="h-5 w-5" />
                  </button>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cards for smaller screens */}
      <div className="md:hidden p-0 flex flex-col gap-4">
        {products?.map((product, index) => (
          <div
            key={index}
            className="bg-gradient-to-r bg-gray-900 shadow-lg rounded-lg overflow-hidden p-4 flex flex-col justify-between h-full"
          >
            <img
              className="h-40 w-full object-cover rounded-md"
              src={product?.variations[0]?.colors[0]?.imageUrls[0]}
              alt={product.name}
            />
            <div className="mt-4 text-center">
              <p className="text-white font-semibold text-lg truncate max-w-[15ch]">
                {product.name}
              </p>
              <p className="text-gray-300 mt-2 text-sm">
                {product.category?.grandchild?.name ||
                  product.category?.child?.name ||
                  product.category?.parent?.name}{" "}
              </p>
              <p className="text-gray-200 mt-1 font-bold text-xl">
                $
                {product.variations[0]?.colors[0]?.sizes[0].price.toFixed(2) ||
                  "N/A"}
              </p>

              <div className="mt-4 flex justify-center space-x-2">
                <button
                  onClick={() => toggleFeaturedProduct(product._id)}
                  className={`rounded-full p-2 ${
                    product.isFeatured
                      ? "bg-yellow-500 text-gray-900"
                      : "bg-gray-600 text-gray-300"
                  } transition-colors duration-200`}
                >
                  <Star className="h-6 w-6" />
                </button>

                <button
                  onClick={() => deleteProduct(product._id)}
                  className="rounded-full bg-red-600 p-2 transition-colors duration-200 hover:bg-red-700"
                >
                  <Trash className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProductsList;
