import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { endpoints } from '../services/api.js';
import { useToast } from './ToastContext.jsx';
import { useTelegram } from '../hooks/useTelegram.js';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('daramini_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [serverCart, setServerCart] = useState(null);

  const toast = useToast();
  const { haptic } = useTelegram();

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('daramini_cart', JSON.stringify(items));
    if (items.length > 0) {
      recalculateCart(items, couponCode);
    } else {
      setServerCart(null);
      setDiscountInfo(null);
    }
  }, [items]);

  const recalculateCart = useCallback(async (currentItems, currentCoupon) => {
    if (!currentItems.length) return;
    setIsCalculating(true);
    try {
      const payloadItems = currentItems.map((i) => ({
        productId: i.id || i.product_id,
        quantity: i.quantity
      }));
      const res = await endpoints.calculateCart(payloadItems, currentCoupon || undefined);
      if (res.success && res.data) {
        setServerCart(res.data);
        if (res.data.coupon) {
          setDiscountInfo(res.data.coupon);
        }

        // Live Synchronize: Ensure every cart item strictly follows the latest database price
        if (Array.isArray(res.data.items) && res.data.items.length > 0) {
          setItems((prev) => {
            let changed = false;
            const updated = prev.map((local) => {
              const matchedServer = res.data.items.find(
                (si) => si.product_id === local.id || si.product_id === local.product_id
              );
              if (matchedServer) {
                const livePrice = Number(matchedServer.unit_price);
                if (Number(local.price) !== livePrice || (matchedServer.product_name && local.name !== matchedServer.product_name)) {
                  changed = true;
                  return {
                    ...local,
                    price: livePrice,
                    name: matchedServer.product_name || local.name
                  };
                }
              }
              return local;
            });
            return changed ? updated : prev;
          });
        }
      }
    } catch (err) {
      // If coupon failed, reset coupon
      if (currentCoupon) {
        setCouponCode('');
        setDiscountInfo(null);
        toast.warning(err.message);
      }
    } finally {
      setIsCalculating(false);
    }
  }, [toast]);

  const addToCart = (product, quantity = 1, forceSetQty = false) => {
    haptic('medium');
    const freshPrice = Number(product.discount_price !== null && product.discount_price !== undefined ? product.discount_price : product.price);
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === product.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = forceSetQty ? quantity : updated[existingIdx].quantity + quantity;
        updated[existingIdx] = { 
          ...updated[existingIdx], 
          price: freshPrice,
          name: product.name || updated[existingIdx].name,
          customerNotes: product.customerNotes || updated[existingIdx].customerNotes,
          quantity: newQty 
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            name_km: product.name_km,
            price: freshPrice,
            stock_type: product.stock_type,
            images: product.images,
            customerNotes: product.customerNotes,
            quantity
          }
        ];
      }
    });
  };

  const buyNow = (product, quantity = 1) => {
    haptic('medium');
    const freshPrice = Number(product.discount_price !== null && product.discount_price !== undefined ? product.discount_price : product.price);
    const single = [
      {
        id: product.id,
        name: product.name,
        name_km: product.name_km,
        price: freshPrice,
        stock_type: product.stock_type,
        images: product.images,
        customerNotes: product.customerNotes,
        quantity
      }
    ];
    setItems(single);
    localStorage.setItem('daramini_cart', JSON.stringify(single));
  };

  const updateQuantity = (productId, quantity) => {
    haptic('selection');
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId) => {
    haptic('light');
    setItems((prev) => prev.filter((item) => item.id !== productId));
    toast.info('Item removed from cart.');
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountInfo(null);
    setServerCart(null);
  };

  const applyCoupon = async (code) => {
    if (!code) return;
    try {
      setIsCalculating(true);
      const payloadItems = items.map((i) => ({ productId: i.id, quantity: i.quantity }));
      const res = await endpoints.calculateCart(payloadItems, code);
      if (res.success && res.data) {
        setServerCart(res.data);
        setCouponCode(code);
        setDiscountInfo(res.data.coupon);
        haptic('success');
        toast.success(`Coupon applied! Saved $${res.data.discountAmount}`);
      }
    } catch (err) {
      haptic('error');
      toast.error(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountInfo(null);
    recalculateCart(items, '');
  };

  const totalItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const subtotal = serverCart
    ? serverCart.subtotal
    : items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);

  const discountAmount = serverCart ? serverCart.discountAmount : 0;
  const finalTotal = serverCart ? serverCart.totalAmount : subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        finalTotal: Number(finalTotal.toFixed(2)),
        couponCode,
        discountInfo,
        serverCart,
        isCalculating,
        addToCart,
        buyNow,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        recalculateCart: () => recalculateCart(items, couponCode)
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
