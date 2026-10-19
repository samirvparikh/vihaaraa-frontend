import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import Search from './pages/Search';
import Account from './pages/Account';
import { Login, Register } from './pages/Auth';
import InfoPage from './pages/InfoPage';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collections/:handle" element={<Collection />} />
          <Route path="product/:slug" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:id" element={<OrderSuccess />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="search" element={<Search />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="account" element={<Account />} />
          <Route path="pages/:page" element={<InfoPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
