import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Components
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSummary from './pages/OrderSummary';

// Context
import { CartContext } from './context/CartContext';

function App() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (product) => {
    setCart(cart.filter(item => item.id !== product.id));
  };

  return (
    <BrowserRouter>
      <CartContext.Provider value={{ cart, handleAddToCart, handleRemoveFromCart }}>
        <Routes>
          <Route path="/products" element={<ProductList products={products} />} />
          <Route path="/products/:id" element={<ProductDetail products={products} />} />
          <Route path="/cart" element={<Cart cart={cart} />} />
          <Route path="/checkout" element={<Checkout cart={cart} />} />
          <Route path="/orders" element={<OrderSummary />} />
        </Routes>
      </CartContext.Provider>
    </BrowserRouter>
  );
}

export default App;
```

```jsx
// pages/ProductList.js
import React from 'react';
import { Link } from 'react-router-dom';

const ProductList = ({ products }) => {
  return (
    <div>
      <h1>Product List</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
```

```jsx
// pages/ProductDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const ProductDetail = ({ products }) => {
  const { id } = useParams();
  const product = products.find(product => product.id === parseInt(id));
  const { handleAddToCart } = useContext(CartContext);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
    </div>
  );
};

export default ProductDetail;
```

```jsx
// pages/Cart.js
import React from 'react';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Cart = ({ cart }) => {
  const { handleRemoveFromCart } = useContext(CartContext);

  return (
    <div>
      <h1>Cart</h1>
      <ul>
        {cart.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => handleRemoveFromCart(product)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
```

```jsx
// pages/Checkout.js
import React from 'react';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Checkout = ({ cart }) => {
  const { handleRemoveFromCart } = useContext(CartContext);

  const handleCheckout = () => {
    // Implement checkout logic here
  };

  return (
    <div>
      <h1>Checkout</h1>
      <ul>
        {cart.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

export default Checkout;
```

```jsx
// pages/OrderSummary.js
import React from 'react';

const OrderSummary = () => {
  return (
    <div>
      <h1>Order Summary</h1>
      <p>Thank you for your order!</p>
    </div>
  );
};

export default OrderSummary;
```

```jsx
// context/CartContext.js
import React, { createContext, useState } from 'react';

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (product) => {
    setCart(cart.filter(item => item.id !== product.id));
  };

  return (
    <CartContext.Provider value={{ cart, handleAddToCart, handleRemoveFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };