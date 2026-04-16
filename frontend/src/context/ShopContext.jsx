import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

export const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  return (
    <ShopContext.Provider value={{ categories }}>
      {children}
    </ShopContext.Provider>
  );
};
