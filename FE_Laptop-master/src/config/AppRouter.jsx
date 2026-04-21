import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminLayout from "../layouts/AdminLayout";
import Header from "../components/header/Header";
import HomeScreen from "../page/client/HomeScreen";
import CartPage from "../page/client/CartPage";
import Footer from "../components/footer/Footer";
import '../App.scss';
import PurchaseHistory from "../page/client/PurchaseHistory";
import OrderSuccess from "../page/client/OrderSuccess";
import CheckoutConfirmation from "../page/client/CheckoutConfirmation";
import LaptopDetail from "../page/client/LaptopDetail";
import VoucherPage from "../page/client/VoucherPage";
import LaptopGrid from "../page/client/LaptopGrid";
import DialogflowMessenger from "../page/client/DialogflowMessenger";
import Dashboard from '../page/admin/dashboard/Dashbarđ';
import BrandManagement from '../page/admin/brand/BrandManagement';
import CategoryManagement from '../page/admin/category/CategoryManagement';
import ChatManager from "../page/admin/ChatManager";
import DiscountManagement from '../page/admin/discount/DiscountManagement';
import UserManagement from '../page/admin/user/UserManagement';
import ProductManagement from '../page/admin/product/ProductManagement';
import CreateProduct from '../page/admin/product/CreateProduct';
import OrderManagement from '../page/admin/order/OrderManagement';
import AdminProductDetail from '../page/admin/product/AdminProductDetail';
import FavoritesScreen from "../page/client/FavoritesScreen";
import UpdateProduct from '../page/admin/product/UpdateProduct';
import DashboardPage from "../page/admin/dashboard/Dashbarđ";
import WithdrawalScreen from "../page/client/WithdrawalScreen";
import WithdrawalManagement from '../page/admin/withdrawal/WithdrawalManagement';
import WithdrawalHistory from "../page/client/WithdrawalHistory";
import ClientChatWidgets from "../components/ClientChatWidgets";

// Layout component cho user routes
const UserLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
    <ClientChatWidgets />
  </>
);

export function AppRouter() {
   return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<UserLayout><HomeScreen /></UserLayout>} />
      <Route path="/result" element={<UserLayout><OrderSuccess /></UserLayout>} />
      <Route path="/checkout" element={<UserLayout><CheckoutConfirmation /></UserLayout>} />
      <Route path="/cart/:id" element={<UserLayout><CartPage /></UserLayout>} />
      <Route path="/products/:id" element={<UserLayout><LaptopDetail /></UserLayout>} />
      <Route path="/voucher" element={<UserLayout><VoucherPage /></UserLayout>} />
      <Route path="/favorites" element={<UserLayout><FavoritesScreen /></UserLayout>} />
      <Route path="/history/:id" element={<UserLayout><PurchaseHistory /></UserLayout>} />
      <Route path="/search/:text" element={<UserLayout><LaptopGrid /></UserLayout>} />
      <Route path="/search" element={<UserLayout><LaptopGrid /></UserLayout>} />
      <Route path="/wallet/:id" element={<UserLayout><WithdrawalScreen /></UserLayout>} />
      <Route path="/wallet-history/:id" element={<UserLayout><WithdrawalHistory /></UserLayout>} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute><AdminLayout><DashboardPage /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/brands" element={<PrivateRoute><AdminLayout><BrandManagement /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/categories" element={<PrivateRoute><AdminLayout><CategoryManagement /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/discounts" element={<PrivateRoute><AdminLayout><DiscountManagement /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute><AdminLayout><UserManagement /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/laptops" element={<PrivateRoute><AdminLayout><ProductManagement /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/laptops/create" element={<PrivateRoute><AdminLayout><CreateProduct /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/laptops/update/:id" element={<PrivateRoute><AdminLayout><UpdateProduct /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/message" element={<PrivateRoute><AdminLayout><ChatManager /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/laptops/detail/:id" element={<PrivateRoute><AdminLayout><AdminProductDetail /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/orders" element={<PrivateRoute><AdminLayout><OrderManagement /></AdminLayout></PrivateRoute>} />
      <Route path="/admin/withdrawals" element={<PrivateRoute><AdminLayout><WithdrawalManagement /></AdminLayout></PrivateRoute>} />
      
      {/* Catch-all routes */}
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
