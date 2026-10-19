import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { useStore } from '../context/StoreContext';

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      {toast.message}
    </div>
  );
}

export default function Layout() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  );
}
