import React, { useState, useEffect, useContext } from "react";
import { 
  Table, 
  Button, 
  Input, 
  Row, 
  Col, 
  Modal, 
  Form, 
  Typography, 
  Select, 
  Card, 
  Tag, 
  Divider,
  Space,
  Descriptions,
  Pagination,
  ConfigProvider,
  Empty,
  DatePicker // Thêm import DatePicker
} from "antd";
import { 
  SearchOutlined, 
  EditOutlined, 
  EyeOutlined, 
  SortAscendingOutlined, 
  SortDescendingOutlined,
  ExclamationCircleFilled,
  CalendarOutlined, // Thêm import icon Calendar
  CheckCircleOutlined,
  FilePdfOutlined // Thêm import icon PDF
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { getAllOrders, updateOrderStatus, acceptRefund } from "../../../Redux/actions/OrderItemThunk";
import dayjs from 'dayjs';
import { NotificationContext } from '../../../components/NotificationProvider';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import font files
import timesNewRomanNormal from '../../../assets/fonts/times.ttf';
import timesNewRomanBold from '../../../assets/fonts/times-bold.ttf';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Helper function to map status to color
const getStatusColor = (status) => {
  const statusColors = {
    CANCELLED: "red",
    COMPLETED: "green",
    CONFIRMED: "blue",
    PENDING: "orange",
    SHIPPED: "purple"
  };
  return statusColors[status] || "default";
};
// Helper function để chuyển đổi OrderStatus sang tiếng Việt
const getStatusText = (status) => {
  const statusMap = {
    CANCELLED: "Đã hủy",
    COMPLETED: "Hoàn thành",
    CONFIRMED: "Đã xác nhận",
    PENDING: "Đang xử lý",
    SHIPPED: "Đang giao hàng"
  };
  return statusMap[status] || status;
};
// Helper function to map payment status to color
const getPaymentStatusColor = (status) => {
  const statusColors = {
    FAILED: "red",
    PAID: "green",
    REFUNDED: "orange",
    REFUNDED_SUCCESSFUL: "cyan",
    UNPAID: "gold"
  };
  return statusColors[status] || "default";
};

// Helper function để chuyển đổi PaymentStatus sang tiếng Việt
const getPaymentStatusText = (status) => {
  const statusMap = {
    FAILED: "Thất bại",
    PAID: "Đã thanh toán",
    REFUNDED: "Yêu cầu hoàn tiền",
    REFUNDED_SUCCESSFUL: "Đã hoàn tiền",
    UNPAID: "Chưa thanh toán"
  };
  return statusMap[status] || status;
};

// Helper function to format address
const formatAddress = (info) => {
  if (!info || !info.ward) return "N/A";
  const { detailAddress, ward } = info;
  return `${detailAddress}, ${ward.name}, ${ward.district.name}, ${ward.district.province.name}`;
};

const OrderManagement = () => {
  // State for orders data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filtering and sorting state
  const [searchText, setSearchText] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Modal state
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isStatusUpdateVisible, setIsStatusUpdateVisible] = useState(false);
  
  // Add this new state
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState(null);
  
  // Form for status update
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  // Thêm state cho lọc theo ngày tháng
  const [dateRange, setDateRange] = useState(null);
  
  // Replace messageApi with notification context
  const notification = useContext(NotificationContext);
  
  // Load order data
  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, searchText, paymentMethod, paymentStatus, orderStatus, sortField, sortDirection, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Lấy ra startDate và endDate từ dateRange
      let startDate = null;
      let endDate = null;
      
      if (dateRange && dateRange.length === 2) {
        startDate = dateRange[0].format('YYYY-MM-DD');
        endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const res = await dispatch(getAllOrders(
        startDate,
        endDate,
        orderStatus,
        paymentMethod,
        paymentStatus,
        currentPage,
        pageSize,
        sortField,
        sortDirection
      ));
      
      if (res && res.content) {
        setOrders(res.content);
        setTotalElements(res.totalElements);
      } else {
        notification.warning({
          message: "Không có đơn hàng nào"
        });
      }
    } catch (error) {
      notification.error({
        message: "Đã xảy ra lỗi khi tải dữ liệu"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchText('');
    setPaymentMethod(null);
    setPaymentStatus(null);
    setOrderStatus(null);
    setSortField("createdAt");
    setSortDirection("desc");
    setDateRange(null); // Reset dateRange
    setCurrentPage(1);
  };
  
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const handleViewDetails = (order) => {
    setCurrentOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleStatusUpdateModal = (order) => {
    // Check if the order is cancelled or completed
    if (order.status === "CANCELLED") {
      notification.warning({
        message: "Không thể cập nhật",
        description: "Đơn hàng đã bị hủy không thể cập nhật trạng thái."
      });
      return;
    }
    
    if (order.status === "COMPLETED") {
      notification.warning({
        message: "Không thể cập nhật",
        description: "Đơn hàng đã hoàn thành không thể cập nhật trạng thái."
      });
      return;
    }
    
    setCurrentOrder(order);
    form.setFieldsValue({ status: order.status });
    setIsStatusUpdateVisible(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const values = await form.validateFields();
      
      // Additional check to ensure the order is not cancelled or completed
      if (currentOrder.status === "CANCELLED") {
        notification.warning({
          message: "Không thể cập nhật",
          description: "Đơn hàng đã bị hủy không thể cập nhật trạng thái."
        });
        setIsStatusUpdateVisible(false);
        return;
      }
      
      if (currentOrder.status === "COMPLETED") {
        notification.warning({
          message: "Không thể cập nhật",
          description: "Đơn hàng đã hoàn thành không thể cập nhật trạng thái."
        });
        setIsStatusUpdateVisible(false);
        return;
      }
      
      setLoading(true);
      const response = await dispatch(updateOrderStatus(currentOrder.id, { status: values.status }));
      
      if (response === 200) {
        notification.success({
          message: "Cập nhật trạng thái đơn hàng thành công"
        });
        fetchOrders();
        setIsStatusUpdateVisible(false);
      } else {
        notification.error({
          message: "Không thể cập nhật trạng thái đơn hàng"
        });
      }
    } catch (error) {
      notification.error({
        message: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSortFieldChange = (value) => {
    setSortField(value);
    setCurrentPage(1);
  };

  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Table columns configuration
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <span>#{id}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      key: "user",
      width: 150,
      render: (user) => <span>{user?.fullName || "N/A"}</span>,
    },
    {
      title: "Người nhận",
      dataIndex: "infoUserReceive",
      key: "recipient",
      width: 150,
      render: (info) => <span>{info?.fullName || "N/A"}</span>,
    },

    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 110,
      render: (method) => {
        const methodMap = {
          "COD": "Thanh toán khi nhận hàng",
          "VNPAY": "VN Pay",
          "IN_APP": "Thanh toán trong ứng dụng"
        };
        return <span>{methodMap[method] || method}</span>;
      },
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 150, // Mở rộng độ rộng để đủ chứa chữ tiếng Việt
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {getPaymentStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => formatDate(date),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date) => date ? formatDate(date) : "-",
    },

    // Thêm cột tổng tiền vào cấu hình columns - thêm vào trước cột "Thao tác"
    {
      title: "Tổng tiền",
      key: "totalAmount",
      width: 150,
      render: (_, record) => {
        // Tính tổng tiền sản phẩm
        const subtotal = record.orderItems?.reduce(
          (total, item) => total + (item.priceAtOrderTime * item.quantity), 0
        ) || 0;
        
        // Tính giảm giá nếu có
        const discountAmount = record.discount ? calculateDiscountAmount(record) : 0;
        
        // Tổng thanh toán
        const total = subtotal - discountAmount;
        
        return (
          <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
            {new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND',
              maximumFractionDigits: 0
            }).format(total)}
          </span>
        );
      },
    },
    
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
            size="middle"
            title="Xem chi tiết"
            style={{ borderRadius: '4px' }}
          />
          {record.status !== "CANCELLED" && record.status !== "COMPLETED" && (
            <Button 
              type="primary"
              style={{ background: '#52c41a', borderRadius: '4px' }}
              icon={<EditOutlined />}
              onClick={() => handleStatusUpdateModal(record)}
              size="middle"
              title="Cập nhật trạng thái"
            />
          )}
          {record.paymentStatus === "REFUNDED" && (
            <Button 
              type="primary"
              style={{ background: '#1890ff', borderRadius: '4px' }}
              icon={<CheckCircleOutlined />}
              onClick={() => showRefundModal(record)}
              size="middle"
              title="Chấp nhận hoàn tiền"
            />
          )}
          {/* Thêm nút xuất hoá đơn nếu đơn hàng đã hoàn thành */}
          {record.status === "COMPLETED" && (
            <Button 
              type="primary"
              style={{ background: '#722ed1', borderRadius: '4px' }}
              icon={<FilePdfOutlined />}
              onClick={() => exportInvoiceToPdf(record)}
              size="middle"
              title="Xuất hoá đơn"
            />
          )}
        </Space>
      ),
    },
  ];

  // Thêm hàm tính giá trị giảm giá
  const calculateDiscountAmount = (order) => {
    if (!order.discount) return 0;

    const { discount } = order;
    const subtotal = order.orderItems.reduce(
      (total, item) => total + item.priceAtOrderTime * item.quantity,
      0
    );

    if (discount.discountType === "PERCENT") {
      // Giảm giá theo phần trăm
      return (subtotal * discount.discountValue) / 100;
    } else if (discount.discountType === "FIXED") {
      // Giảm giá cố định
      return discount.discountValue;
    }
    
    return 0;
  };

  // Add this new function to handle refund modal
  const showRefundModal = (order) => {
    setOrderToRefund(order);
    setIsRefundModalVisible(true);
  };
  
  // Add this new function to handle refund acceptance
  const handleAcceptRefund = async () => {
    if (!orderToRefund) return;
    
    try {
      setLoading(true);
      const response = await dispatch(acceptRefund(orderToRefund.id));
      
      if (response === 200) {
        notification.success({
          message: "Hoàn tiền thành công",
          description: `Đơn hàng #${orderToRefund.id} đã được hoàn tiền thành công.`
        });
        fetchOrders();
      } else {
        notification.error({
          message: "Hoàn tiền thất bại",
          description: "Không thể hoàn tiền cho đơn hàng này."
        });
      }
    } catch (error) {
      console.error("Error accepting refund:", error);
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Không thể xử lý yêu cầu hoàn tiền."
      });
    } finally {
      setLoading(false);
      setIsRefundModalVisible(false);
      setOrderToRefund(null);
    }
  };

  // Thêm hàm xuất hóa đơn PDF
  const exportInvoiceToPdf = (order) => {
    // Khởi tạo một tài liệu PDF với kích thước A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Đăng ký font Times New Roman
    doc.addFont(timesNewRomanNormal, "TimesNewRoman", "normal");
    doc.addFont(timesNewRomanBold, "TimesNewRoman", "bold");
    
    // Tiêu đề hoá đơn
    doc.setFontSize(20);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('HÓA ĐƠN BÁN HÀNG', 105, 20, { align: 'center' });
    
    // Thông tin cửa hàng
    doc.setFontSize(12);
    doc.setFont('TimesNewRoman', 'normal');
    doc.text('TECH LAPTOP', 105, 30, { align: 'center' });
    doc.text('Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HN', 105, 35, { align: 'center' });
    doc.text('Điện thoại: 0123456789 - Email: contact@techstore.com', 105, 40, { align: 'center' });
    
    // Thông tin hoá đơn
    doc.setFontSize(11);
    doc.line(15, 45, 195, 45); // Căn chỉnh đường kẻ với lề đối xứng
    doc.text(`Mã đơn hàng: #${order.id}`, 15, 55);
    doc.text(`Ngày tạo: ${dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}`, 15, 60);
    doc.text(`Trạng thái: ${getStatusText(order.status)}`, 15, 65);
    doc.text(`Phương thức thanh toán: ${
      order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
      order.paymentMethod === 'VNPAY' ? 'VN Pay' :
      order.paymentMethod === 'IN_APP' ? 'Thanh toán trong ứng dụng' :
      order.paymentMethod
    }`, 15, 70);
    
    // THÔNG TIN NGƯỜI MUA
    doc.setFontSize(12);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('THÔNG TIN NGƯỜI MUA', 15, 80);
    doc.setFont('TimesNewRoman', 'normal');
    doc.setFontSize(11);
    doc.text(`Họ tên: ${order.user?.fullName || 'N/A'}`, 15, 85);
    doc.text(`Email: ${order.user?.email || 'N/A'}`, 15, 90);
    doc.text(`Điện thoại: ${order.user?.phoneNumber || 'N/A'}`, 15, 95);
    
    // THÔNG TIN NGƯỜI NHẬN - Xuống dưới người mua
    let currentY = 105;
    doc.setFontSize(12);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('THÔNG TIN NGƯỜI NHẬN', 15, currentY);
    doc.setFont('TimesNewRoman', 'normal');
    doc.setFontSize(11);
    
    currentY += 5;
    doc.text(`Họ tên: ${order.infoUserReceive?.fullName || 'N/A'}`, 15, currentY);
    currentY += 5;
    doc.text(`Email: ${order.infoUserReceive?.email || 'N/A'}`, 15, currentY);
    currentY += 5;
    doc.text(`Điện thoại: ${order.infoUserReceive?.phoneNumber || 'N/A'}`, 15, currentY);
    
    // Xử lý địa chỉ dài - chia thành nhiều dòng nếu cần
    const address = formatAddress(order.infoUserReceive);
    const maxWidth = 175; // Điều chỉnh để phù hợp với lề mới
    const addressLines = doc.splitTextToSize(address, maxWidth);
    
    currentY += 5;
    doc.text(`Địa chỉ:`, 15, currentY);
    addressLines.forEach((line, index) => {
      doc.text(line, 30, currentY + (index * 5));
    });
    
    // Điều chỉnh vị trí bắt đầu cho bảng
    const tableStartY = currentY + (addressLines.length * 5) + 10;
    
    // Danh sách sản phẩm
    doc.setFontSize(12);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('CHI TIẾT SẢN PHẨM', 15, tableStartY);
    
    // Tạo bảng chi tiết sản phẩm
    const tableColumn = [
      "STT", 
      "Tên sản phẩm", 
      "Mã SP", 
      "Màu sắc", 
      "Đơn giá", 
      "SL", 
      "Thành tiền"
    ];
    
    // Dữ liệu cho bảng
    const tableRows = [];
    
    order.orderItems.forEach((item, index) => {
      const priceFormatted = new Intl.NumberFormat('vi-VN', { 
        style: 'decimal', 
        maximumFractionDigits: 0
      }).format(item.priceAtOrderTime);
      
      const totalFormatted = new Intl.NumberFormat('vi-VN', { 
        style: 'decimal', 
        maximumFractionDigits: 0
      }).format(item.priceAtOrderTime * item.quantity);
      
      tableRows.push([
        index + 1,
        item.productName,
        item.productCode,
        item.productColor,
        priceFormatted,
        item.quantity,
        totalFormatted
      ]);
    });
    
    // Tạo bảng với jspdf-autotable - căn giữa hoàn toàn
    autoTable(doc, {
      startY: tableStartY + 5,
      head: [tableColumn],
      body: tableRows,
      headStyles: { 
        fillColor: [25, 118, 210], 
        textColor: 255,
        fontStyle: 'bold',
        font: 'TimesNewRoman',
        halign: 'center'
      },
      theme: 'grid',
      styles: {
        overflow: 'linebreak',
        cellPadding: 3,
        fontSize: 10,
        font: 'TimesNewRoman',
        lineWidth: 0.1,
        lineColor: [80, 80, 80]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },    // STT
        1: { cellWidth: 45 },                      // Tên sản phẩm
        2: { cellWidth: 25, halign: 'center' },    // Mã SP
        3: { cellWidth: 25, halign: 'center' },    // Màu sắc
        4: { cellWidth: 30, halign: 'right' },     // Đơn giá
        5: { cellWidth: 15, halign: 'center' },    // SL
        6: { cellWidth: 30, halign: 'right' }      // Thành tiền
      },
      margin: { left: 15, right: 15 },             // Lề đối xứng
      tableWidth: 'auto'
    });
    
    // Tính tổng tiền
    const finalY = (doc.lastAutoTable?.finalY || tableStartY + 5) + 15;
    
    // Tổng tiền sản phẩm
    const subtotal = order.orderItems.reduce(
      (total, item) => total + (item.priceAtOrderTime * item.quantity), 0
    );
    
    // Tính giảm giá
    const discountAmount = order.discount ? calculateDiscountAmount(order) : 0;
    
    // Tổng thanh toán
    const total = subtotal - discountAmount;
    
    // Thiết kế lại phần tổng thanh toán - căn giữa và đẹp hơn
    doc.setFontSize(11);
    doc.setFont('TimesNewRoman', 'normal');

    // Tính toán vị trí căn giữa cho phần tổng thanh toán
    const summaryBoxWidth = 85;           // Tăng chiều rộng từ 80 lên 85
    const summaryBoxX = (210 - summaryBoxWidth) / 2;  // Căn giữa theo trang A4 (210mm)
    const summaryBoxHeight = order.discount ? 45 : 30; // Tăng chiều cao để đủ chỗ cho text
    
    // Vẽ khung tổng kết với thiết kế đẹp hơn
    doc.setFillColor(248, 249, 250);  // Màu nền xám nhạt
    doc.roundedRect(summaryBoxX, finalY - 5, summaryBoxWidth, summaryBoxHeight, 2, 2, 'F');
    
    // Vẽ viền
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(summaryBoxX, finalY - 5, summaryBoxWidth, summaryBoxHeight, 2, 2, 'D');
    
    // Vị trí cho label và value bên trong box
    const labelX = summaryBoxX + 5;
    const valueX = summaryBoxX + summaryBoxWidth - 5;
    
    let summaryY = finalY + 3; // Tăng từ +2 lên +3 để có thêm khoảng cách
    
    // Hiển thị tổng tiền sản phẩm
    doc.setFont('TimesNewRoman', 'normal');
    doc.setFontSize(10); // Giảm font size từ 11 xuống 10
    doc.text('Tổng tiền sản phẩm:', labelX, summaryY);
    doc.text(`${new Intl.NumberFormat('vi-VN', { 
      style: 'decimal', 
      maximumFractionDigits: 0
    }).format(subtotal)} VNĐ`, valueX, summaryY, { align: 'right' });

    // Hiển thị giảm giá nếu có
    if (order.discount) {
      summaryY += 8; // Tăng khoảng cách từ 7 lên 8
      
      // Hiển thị loại giảm giá
      let discountLabel = 'Giảm giá:';
      if (order.discount.discountType === "PERCENT") {
        discountLabel = `Giảm giá (${order.discount.discountValue}%):`;
      }
      
      doc.text(discountLabel, labelX, summaryY);
      doc.text(`-${new Intl.NumberFormat('vi-VN', { 
        style: 'decimal', 
        maximumFractionDigits: 0
      }).format(discountAmount)} VNĐ`, valueX, summaryY, { align: 'right' });
    }

    // Vẽ đường kẻ ngang phân cách bên trong box
    summaryY += 6; // Tăng từ 4 lên 6
    doc.setLineWidth(0.3);
    doc.setDrawColor(150, 150, 150);
    doc.line(labelX, summaryY, valueX, summaryY);

    // Tổng thanh toán - làm nổi bật
    summaryY += 8; // Tăng từ 6 lên 8 để tránh đè lên đường kẻ
    doc.setFont('TimesNewRoman', 'bold');
    doc.setFontSize(11); // Giữ nguyên font size cho phần quan trọng
    doc.text('TỔNG THANH TOÁN:', labelX, summaryY);
    doc.setTextColor(220, 53, 69); // Màu đỏ cho số tiền
    doc.text(`${new Intl.NumberFormat('vi-VN', { 
      style: 'decimal', 
      maximumFractionDigits: 0
    }).format(total)} VNĐ`, valueX, summaryY, { align: 'right' });
    
    // Reset màu chữ về đen
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    // Chữ ký - đặt cách khoảng từ phần tổng thanh toán
    summaryY += 30; // Tăng từ 25 lên 30 để có khoảng cách rõ ràng hơn
    doc.setFont('TimesNewRoman', 'normal');
    doc.text('Ngày xuất hoá đơn: ' + dayjs().format('DD/MM/YYYY'), 15, summaryY);

    summaryY += 15;
    
    // Căn chỉnh chữ ký đối xứng
    const signatureY = summaryY;
    const leftSignatureX = 52;   // Vị trí chữ ký bên trái
    const rightSignatureX = 158; // Vị trí chữ ký bên phải
    
    doc.text('Người bán hàng', leftSignatureX, signatureY, { align: 'center' });
    doc.text('(Ký, ghi rõ họ tên)', leftSignatureX, signatureY + 5, { align: 'center' });

    doc.text('Người mua hàng', rightSignatureX, signatureY, { align: 'center' });
    doc.text('(Ký, ghi rõ họ tên)', rightSignatureX, signatureY + 5, { align: 'center' });

    // Lưu file PDF
    doc.save(`Hoa_don_${order.id}_${dayjs().format('DDMMYYYY')}.pdf`);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#1890ff',
            headerColor: 'white',
          },
        },
      }}
  >
      <div style={{ padding: 24, background: '#fff' }}>
        
        {/* Title */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 32
        }}>
          <Title 
            level={2} 
            style={{ 
              margin: 0, 
              fontWeight: 800
            }}
          >
            Quản lý đơn hàng
          </Title>
        </div>
        
        {/* Search and Filters */}
        <div style={{ 
          marginBottom: 24,
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Thêm RangePicker cho lọc theo khoảng thời gian */}
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ width: 280 }}
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            allowClear
            size="large"
          />
          
        <Select
          placeholder="Phương thức thanh toán"
          style={{ width: 180 }}
          allowClear
          onChange={(value) => setPaymentMethod(value)}
          value={paymentMethod}
          size="large"
        >
          <Option value="COD">Thanh toán khi nhận hàng</Option>
          <Option value="VNPAY">VN Pay</Option>
          <Option value="IN_APP">Thanh toán trong ứng dụng</Option>
        </Select>
        <Select
          placeholder="Trạng thái thanh toán"
          style={{ width: 180 }}
          allowClear
          onChange={(value) => setPaymentStatus(value)}
          value={paymentStatus}
          size="large"
        >
          <Option value="FAILED">Thất bại</Option>
          <Option value="PAID">Đã thanh toán</Option>
          <Option value="REFUNDED">Yêu cầu hoàn tiền</Option>
          <Option value="REFUNDED_SUCCESSFUL">Đã hoàn tiền</Option>
          <Option value="UNPAID">Chưa thanh toán</Option>
        </Select>
          
        <Select
          placeholder="Trạng thái đơn hàng"
          style={{ width: 180 }}
          allowClear
          onChange={(value) => setOrderStatus(value)}
          value={orderStatus}
          size="large"
        >
          <Option value="CANCELLED">Đã hủy</Option>
          <Option value="COMPLETED">Hoàn thành</Option>
          <Option value="CONFIRMED">Đã xác nhận</Option>
          <Option value="PENDING">Đang xử lý</Option>
          <Option value="SHIPPED">Đang giao hàng</Option>
        </Select>
        
        </div>
        
        {/* Custom Pagination and Sorting Controls */}
        <div style={{ 
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>Sắp xếp theo:</span>
            <Select 
              value={sortField} 
              onChange={handleSortFieldChange}
              style={{ width: 180 }}
              size="middle"
            >
                <Option value="createdAt">Ngày tạo</Option>
              <Option value="id">Mã đơn hàng</Option>
              <Option value="updatedAt">Ngày cập nhật</Option>
            </Select>
            
            <Button 
              onClick={handleSortDirectionChange}
              icon={sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              size="middle"
            >
              {sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>Hiển thị:</span>
            <Select 
              value={pageSize} 
              onChange={(value) => handlePageSizeChange(currentPage, value)}
              style={{ width: 80 }}
              size="middle"
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
            </Select>
            <span>mục / trang</span>
          </div>
        </div>
        
        {/* Orders Table */}
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={false}
          bordered
        />
        
        {/* Custom Pagination Component */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalElements}
            onChange={handlePageChange}
            showQuickJumper={true}
            locale={{ 
              jump_to: "Đến trang", 
              page: "" 
            }}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`}
          />
        </div>
        
        {/* Order Details Modal */}
        <Modal
          title={`Chi tiết đơn hàng #${currentOrder?.id}`}
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
              Đóng
            </Button>,
            // Thêm nút xuất hoá đơn nếu đơn hàng đã hoàn thành
            currentOrder && currentOrder.status === "COMPLETED" && (
              <Button 
                key="export" 
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={() => exportInvoiceToPdf(currentOrder)}
              >
                Xuất hoá đơn
              </Button>
            ),
            // Only show the Update Status button if order is not cancelled or completed
            currentOrder && currentOrder.status !== "CANCELLED" && currentOrder.status !== "COMPLETED" && (
              <Button 
                key="update" 
                type="primary"
                onClick={() => {
                  setIsDetailModalVisible(false);
                  handleStatusUpdateModal(currentOrder);
                }}
              >
                Cập nhật trạng thái
              </Button>
            ),
          ].filter(Boolean)} // Filter out null/false values
          width={800}
        >
          {currentOrder && (
            <>
              <Descriptions title="Thông tin đơn hàng" bordered>
              <Descriptions.Item label="Trạng thái" span={3}>
                <Tag color={getStatusColor(currentOrder.status)}>
                  {getStatusText(currentOrder.status)}
                </Tag>
              </Descriptions.Item>
                
                <Descriptions.Item label="Phương thức thanh toán" span={1}>
                  {(() => {
                    const methodMap = {
                      "COD": "Thanh toán khi nhận hàng",
                      "VNPAY": "VN Pay", 
                      "IN_APP": "Thanh toán trong ứng dụng"
                    };
                    return methodMap[currentOrder.paymentMethod] || currentOrder.paymentMethod;
                  })()}
                </Descriptions.Item>
                
                <Descriptions.Item label="Trạng thái thanh toán" span={2}>
                  <Tag color={getPaymentStatusColor(currentOrder.paymentStatus)}>
                    {getPaymentStatusText(currentOrder.paymentStatus)}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Ngày tạo" span={1}>
                  {dayjs(currentOrder.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                
                <Descriptions.Item label="Cập nhật lần cuối" span={2}>
                  {currentOrder.updatedAt 
                    ? dayjs(currentOrder.updatedAt).format("DD/MM/YYYY HH:mm") 
                    : "Chưa cập nhật"}
                </Descriptions.Item>
                
                <Descriptions.Item label="Ghi chú" span={3}>
                  {currentOrder.note || "Không có ghi chú"}
                </Descriptions.Item>
              </Descriptions>
              
              <Divider />
              
              {/* Thêm phần hiển thị sản phẩm đã đặt */}
              <Title level={4}>Sản phẩm đã đặt</Title>
              {currentOrder.orderItems && currentOrder.orderItems.length > 0 ? (
                <>
                  {currentOrder.orderItems.map((item, index) => (
                    <Card 
                      key={index} 
                      style={{ marginBottom: 16 }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 80, height: 80, marginRight: 16 }}>
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.productName}</div>
                              <div style={{ color: '#666', fontSize: 13 }}>Mã: {item.productCode}</div>
                              <div style={{ color: '#666', fontSize: 13 }}>Màu: {item.productColor}</div>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                                {new Intl.NumberFormat('vi-VN', { 
                                  style: 'currency', 
                                  currency: 'VND',
                                  maximumFractionDigits: 0
                                }).format(item.priceAtOrderTime)}
                              </div>
                              <div style={{ color: '#666', fontSize: 13 }}>Số lượng: {item.quantity}</div>
                              <div style={{ fontWeight: 'bold', marginTop: 4 }}>
                                Thành tiền: {new Intl.NumberFormat('vi-VN', { 
                                  style: 'currency', 
                                  currency: 'VND',
                                  maximumFractionDigits: 0
                                }).format(item.priceAtOrderTime * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {/* Hiển thị tổng tiền */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginTop: 16,
                    marginBottom: 24
                  }}>
                    <Card 
                      style={{ width: 300 }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Tổng tiền sản phẩm:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND',
                            maximumFractionDigits: 0
                          }).format(currentOrder.orderItems.reduce((total, item) => 
                            total + (item.priceAtOrderTime * item.quantity), 0)
                          )}
                        </span>
                      </div>
                      
                      {currentOrder.discount && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>
                            Giảm giá
                            {currentOrder.discount.discountType === "PERCENT" 
                              ? ` (${currentOrder.discount.discountValue}%)` 
                              : ""}:
                          </span>
                          <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                            -{new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND',
                              maximumFractionDigits: 0
                            }).format(calculateDiscountAmount(currentOrder))}
                          </span>
                        </div>
                      )}
                      
                      <Divider style={{ margin: '8px 0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Tổng thanh toán:</span>
                        <span style={{ fontWeight: 'bold', fontSize: 18, color: '#ff4d4f' }}>
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND',
                            maximumFractionDigits: 0
                          }).format(
                            currentOrder.orderItems.reduce((total, item) => 
                              total + (item.priceAtOrderTime * item.quantity), 0) - 
                              calculateDiscountAmount(currentOrder)
                          )}
                        </span>
                      </div>
                    </Card>
                  </div>
                </>
              ) : (
                <Empty description="Không có sản phẩm" />
              )}
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card 
                    title="Thông tin người mua" 
                    bordered={false}
                    style={{ height: '100%' }}
                  >
                    <p><strong>Tên:</strong> {currentOrder.user?.fullName || "N/A"}</p>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card 
                    title="Thông tin người nhận" 
                    bordered={false}
                    style={{ height: '100%' }}
                  >
                    <p><strong>Tên:</strong> {currentOrder.infoUserReceive?.fullName || "N/A"}</p>
                    <p><strong>Email:</strong> {currentOrder.infoUserReceive?.email || "N/A"}</p>
                    <p><strong>SĐT:</strong> {currentOrder.infoUserReceive?.phoneNumber || "N/A"}</p>
                    <p><strong>Địa chỉ:</strong> {formatAddress(currentOrder.infoUserReceive)}</p>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal>
        
        {/* Status Update Modal */}
        <Modal
          title="Cập nhật trạng thái đơn hàng"
          open={isStatusUpdateVisible}
          onCancel={() => setIsStatusUpdateVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsStatusUpdateVisible(false)}>
              Hủy
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={loading}
              onClick={handleStatusUpdate}
            >
              Cập nhật
            </Button>,
          ]}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <ExclamationCircleFilled style={{ color: '#faad14', fontSize: '22px' }} />
            <p style={{ margin: 0 }}>
              Bạn đang cập nhật trạng thái đơn hàng <strong>#{currentOrder?.id}</strong>
            </p>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            initialValues={{ status: currentOrder?.status }}
          >
            {/* Form item cho việc cập nhật trạng thái */}
            <Form.Item
              name="status"
              label="Trạng thái đơn hàng"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select>
                <Option value="CANCELLED">Đã hủy</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="PENDING">Đang xử lý</Option>
                <Option value="SHIPPED">Đang giao hàng</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Refund Confirmation Modal */}
        <Modal
          title="Xác nhận hoàn tiền"
          open={isRefundModalVisible}
          onCancel={() => setIsRefundModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsRefundModalVisible(false)}>
              Hủy
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={loading}
              onClick={handleAcceptRefund}
            >
              Xác nhận hoàn tiền
            </Button>,
          ]}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <ExclamationCircleFilled style={{ color: '#faad14', fontSize: '22px' }} />
            <p style={{ margin: 0 }}>
              Bạn đang xác nhận hoàn tiền cho đơn hàng <strong>#{orderToRefund?.id}</strong>
            </p>
          </div>
          
          <p>
            Hành động này sẽ hoàn tiền cho khách hàng và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
          </p>
          
          {orderToRefund && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginTop: '16px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Khách hàng:</strong> {orderToRefund.user?.fullName}</p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Số tiền hoàn:</strong> {' '}
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND',
                    maximumFractionDigits: 0
                  }).format(
                    orderToRefund.orderItems?.reduce((total, item) => 
                      total + (item.priceAtOrderTime * item.quantity), 0) - 
                      calculateDiscountAmount(orderToRefund)
                  )}
                </span>
              </p>
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default OrderManagement;