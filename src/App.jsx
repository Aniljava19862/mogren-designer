import { Routes, Route } from 'react-router-dom'; 
import Layout from '@/components/commerce/Layout';
 import Home from '@/pages/Home';
  import Shop from '@/pages/Shop';
  import Product from '@/pages/Product'; 
  import Cart from '@/pages/Cart'; 
  import Checkout from '@/pages/Checkout';
   import Login from '@/pages/Login'; 
   import Register from '@/pages/Register'; 
   import OrderSuccess from '@/pages/OrderSuccess';
    import DesignerPage from '@/pages/DesignerPage'; 
    import AdminGuard from '@/admin/AdminGuard'; 
    import AdminDashboard from '@/admin/AdminDashboard'; 
    import AdminProducts from '@/admin/AdminProducts';
     import AdminOrders from '@/admin/AdminOrders';
import Orders from "@/pages/Orders";
import Account from "@/pages/Account";
import RequireAuth from "@/components/RequireAuth";

export default function App() { 
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="shop" element={<Shop />} />
      <Route path="product/:slug" element={<Product />} />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="order-success/:id" element={<OrderSuccess />} />
      <Route path="designer" element={<DesignerPage />} />
      <Route
  path="/orders"
  element={
    <RequireAuth>
      <Orders />
    </RequireAuth>
  }
/>

<Route
  path="/account"
  element={
    <RequireAuth>
      <Account />
    </RequireAuth>
  }
/>
    </Route>
    
    <Route path="admin" element={<AdminGuard />}>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<AdminOrders />} />
    </Route>
  </Routes> }
