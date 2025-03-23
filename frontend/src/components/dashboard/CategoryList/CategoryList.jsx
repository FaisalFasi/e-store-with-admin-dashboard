import React, { useEffect, useState } from "react";
import { useCategoryStore } from "../../../stores/useCategoryStore";

const CategoryList = () => {
  const { getAllCategories } = useCategoryStore();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategories();
      console.log("Data ...:", data);
      setCategories(data);
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories?.map((category) => (
          <li key={category._id}>
            {category.name} - {category.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
