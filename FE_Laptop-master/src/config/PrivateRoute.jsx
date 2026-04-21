import { Navigate } from 'react-router-dom';
import { USER_LOGIN } from '../Utils/Setting/Config';

const PrivateRoute = ({ children }) => {
  const userDetails = JSON.parse(localStorage.getItem(USER_LOGIN)); // Lấy userDetails từ localStorage
  const isAdmin = userDetails?.role === 'ADMIN'; // Kiểm tra role
  if (!isAdmin) {
    return <Navigate to="/" replace />; // Chuyển hướng về trang chủ nếu không phải admin
  }

  return children; // Hiển thị nội dung nếu là admin
};

export default PrivateRoute;