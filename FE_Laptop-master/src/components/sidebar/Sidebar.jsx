import { Link, useLocation } from 'react-router-dom';
import { 
  Laptop, 
  ShoppingBag, 
  Tag, 
  LayoutDashboard, 
  LogOut, 
  Settings,
  Home,
  Users,
  Ticket,
  ShoppingCart,
  Wallet // Add Wallet icon for withdrawals
} from 'lucide-react';
import './sidebar.scss';
import {MessageOutlined} from "@ant-design/icons";

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  console.log(location.pathname);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; // Redirect to home page after logout
  };

  const menuItems = [
    {
      title: 'Quản lý',
      icon: <Settings size={20} />,
      children: [
        {
          path: '/admin/dashboard',
          name: 'Dashboard',
          icon: <LayoutDashboard size={20} />
        },
        {
          path: '/admin/users',
          name: 'Quản lý người dùng',
          icon: <Users size={20} />
        },
        {
          path: '/admin/brands',
          name: 'Quản lý nhãn hàng',
          icon: <ShoppingBag size={20} />
        },
        {
          path: '/admin/categories',
          name: 'Quản lý thể loại laptop',
          icon: <Tag size={20} />
        },
        {
          path: '/admin/laptops',
          name: 'Quản lý laptop',
          icon: <Laptop size={20} />
        },
        {
          path: '/admin/discounts',
          name: 'Quản lý mã giảm giá',
          icon: <Ticket size={20} />
        },
        {
          path: '/admin/orders',
          name: 'Quản lý đơn hàng',
          icon: <ShoppingCart size={20} />
        },
        {
          path: '/admin/withdrawals',
          name: 'Quản lý rút tiền',
          icon: <Wallet size={20} />
        },
        {
          path: '/admin/message',
          name: 'Hỗ trợ khách hàng',
          icon: <MessageOutlined size={20} />
        }
      ]
    }
  ];

  const bottomMenuItems = [
    {
      title: 'Hệ thống',
      items: [
        {
          path: '/',
          name: 'Trang chủ',
          icon: <Home size={20} />
        },
        {
          name: 'Đăng xuất',
          icon: <LogOut size={20} />
        }
      ]
    }
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar__header" style={{ justifyContent:'space-between' }} >
        <div className="logo">
          <Laptop size={24} className="logo-icon"/>
          {!isCollapsed && <span>Laptop Admin</span>}
        </div>
      </div>

      <div className="sidebar__content">
        {menuItems.map((section, index) => (
          <div key={index} className="sidebar__section">
            {!isCollapsed && <div className="section-title">{section.title}</div>}
            {section.children.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar__item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>
        ))}

        {bottomMenuItems.map((section, index) => (
          <div key={index} className="sidebar__section bottom-section">
            {!isCollapsed && <div className="section-title">{section.title}</div>}
            {section.items.map((item) => (
              <Link
                key={item.path || item.name}
                to={item.path || '#'}
                className={`sidebar__item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={item.name === 'Đăng xuất' ? handleLogout : null}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;