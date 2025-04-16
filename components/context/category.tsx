"use client";
import React, { createContext } from "react";

interface CategoriesContextType {
  categories: string[];
}

const categoriesContext = createContext<CategoriesContextType>({
  categories: [],
});

export const CategoriesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [categories, setCategories] = React.useState([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8000/products/category", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseJson = await response.json();
      if (responseJson.success && responseJson.data) {
        let categories = responseJson.data;
        categories.unshift("All");
        setCategories(categories);
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <categoriesContext.Provider value={{ categories }}>
      {children}
    </categoriesContext.Provider>
  );
};

const useCategories = () => React.useContext(categoriesContext);

export default useCategories;
