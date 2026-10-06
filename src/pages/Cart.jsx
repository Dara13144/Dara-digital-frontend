import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Cart() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/shop', { replace: true });
  }, [navigate]);

  return null;
}
