import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vlk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('vlk_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Lỗi lưu giỏ hàng vào localStorage:", e);
    }
  }, [cartItems]);

  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    window.dispatchEvent(new CustomEvent('show-toast', { detail: `Đã thêm "${product.name}" vào giỏ hàng!` }));
  }, []);

  const addMultipleToCart = useCallback((productsArray) => {
    setCartItems(prev => {
      let next = [...prev];
      productsArray.forEach(product => {
        const idx = next.findIndex(i => i.product.id === product.id);
        if (idx !== -1) next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        else next.push({ product, quantity: 1 });
      });
      return next;
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: newQ > 0 ? newQ : 1 };
      }
      return item;
    }));
  }, []);

  const removeItem = useCallback((productId) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('vlk_cart');
  }, []);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalValue = cartItems.reduce((acc, i) => acc + ((i.product?.price || 0) * i.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addMultipleToCart,
      updateQuantity,
      removeItem,
      clearCart,
      totalCartCount,
      totalValue,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

