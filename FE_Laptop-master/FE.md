# HƯỚNG DẪN SỬ DỤNG - WEBSITE BÁN LAPTOP (TECHLAPTOP)

## 1. GIỚI THIỆU TỔNG QUAN

**TechLaptop** là website thương mại điện tử bán laptop, được xây dựng bằng **ReactJS 19**. Website có 2 phần chính:
- **Phía khách hàng (Client)**: Xem, tìm kiếm, mua laptop, chat hỗ trợ, chat AI tư vấn.
- **Phía quản trị (Admin)**: Quản lý sản phẩm, đơn hàng, người dùng, mã giảm giá, v.v.

**Backend** chạy tại `http://localhost:8081` (Spring Boot Java).

---

## 2. CÀI ĐẶT VÀ CHẠY PROJECT

### Yêu cầu
- **Node.js** phiên bản 18 trở lên
- **npm** (đi kèm Node.js)
- Backend đang chạy tại port 8081

### Các bước cài đặt

**Bước 1**: Mở Terminal/CMD, trỏ đến thư mục project:
```
cd d:\FE_Laptop-master
```

**Bước 2**: Cài đặt thư viện:
```
npm install
```

**Bước 3**: Chạy project:
```
npm start
```

**Bước 4**: Mở trình duyệt, truy cập `http://localhost:3000`

---

## 3. CẤU TRÚC THƯ MỤC PROJECT

```
FE_Laptop-master/
├── public/                  # File tĩnh (index.html, favicon)
├── src/                     # Mã nguồn chính
│   ├── App.js               # Component gốc
│   ├── index.js             # Điểm khởi chạy ứng dụng
│   ├── config/              # Cấu hình Router (điều hướng trang)
│   ├── components/          # Thành phần dùng chung (Header, Footer, Sidebar)
│   ├── page/
│   │   ├── client/          # Các trang phía khách hàng
│   │   ├── admin/           # Các trang phía quản trị viên
│   │   ├── account/         # Đăng nhập, Đăng ký, Đổi mật khẩu
│   │   └── style/           # File CSS giao diện
│   ├── Service/             # Gọi API đến Backend
│   ├── Redux/               # Quản lý trạng thái ứng dụng
│   ├── Utils/               # Tiện ích (cấu hình, context so sánh)
│   ├── layouts/             # Bố cục trang Admin
│   └── assets/              # Hình ảnh, font chữ, icon
└── package.json             # Danh sách thư viện sử dụng
```

---

## 4. CÔNG NGHỆ SỬ DỤNG

| Công nghệ | Mô tả |
|---|---|
| ReactJS 19 | Framework giao diện chính |
| React Router DOM 7 | Điều hướng giữa các trang |
| Redux + Redux Thunk | Quản lý trạng thái toàn cục |
| Axios | Gọi API đến Backend |
| Ant Design (antd) | Thư viện giao diện UI |
| Material UI (MUI) | Thư viện giao diện bổ sung |
| STOMP + SockJS | Chat realtime qua WebSocket |
| Chart.js + Recharts | Biểu đồ thống kê |
| React Toastify | Thông báo popup |
| jsPDF + AutoTable | Xuất file PDF |
| XLSX | Xuất file Excel |
| SASS/SCSS | Viết CSS nâng cao |

---

## 5. HƯỚNG DẪN SỬ DỤNG CHO KHÁCH HÀNG

### 5.1. Trang chủ (`/`)
- **Banner quảng cáo** (HeroSection): Hiển thị ảnh quảng cáo lớn.
- **Sản phẩm nổi bật** (ProductSections): Danh sách laptop bán chạy, mới nhất.
- **Đánh giá khách hàng** (TestimonialsNewsletter).
- **Tính năng nổi bật** (Features): Giao hàng miễn phí, bảo hành, đổi trả.
- **Nút Chat hỗ trợ**: Góc dưới bên phải - chat trực tiếp với nhân viên.
- **Nút Chat AI**: Góc dưới - chatbot AI tư vấn laptop theo nhu cầu và ngân sách.

### 5.2. Đăng ký / Đăng nhập
- Nhấn **"Đăng nhập"** hoặc **"Đăng ký"** trên thanh Header.
- **Đăng ký**: Nhập username, email, mật khẩu, họ tên.
- **Đăng nhập**: Nhập username và mật khẩu.
- API: `POST /api/v1/auth/register` và `POST /api/v1/auth/login`.
- Sau khi đăng nhập, hệ thống lưu token và thông tin user vào `localStorage`.

### 5.3. Tìm kiếm & Lọc sản phẩm (`/search`)
- **Thanh tìm kiếm** trên Header: Nhập tên laptop → Enter.
- Trang kết quả cho phép **lọc** theo:
  - Thể loại laptop (Gaming, Văn phòng, Mỏng nhẹ...)
  - Nhãn hàng (Dell, Asus, Lenovo, HP...)
  - Khoảng giá (từ - đến)
- **Sắp xếp** theo: Tên, Giá tăng/giảm.
- Hỗ trợ **phân trang**.

### 5.4. Chi tiết sản phẩm (`/products/:id`)
- **Ảnh sản phẩm**: Xem ảnh lớn + thumbnail, nhấn để chuyển ảnh.
- **Chọn cấu hình**: CPU, RAM, Ổ cứng, GPU - mỗi cấu hình có giá khác nhau.
- **Chọn màu sắc**: Mỗi màu có thể chênh lệch giá.
- **Thông số kỹ thuật**: Tab chi tiết đầy đủ (CPU, RAM, màn hình, pin, cổng kết nối...).
- **Mô tả sản phẩm**: Bài viết giới thiệu chi tiết.
- **Đánh giá**: Xem đánh giá của người mua, viết đánh giá (1-5 sao + bình luận).
- **Nút hành động**:
  - `Mua ngay`: Thêm vào giỏ và chuyển đến giỏ hàng.
  - `Thêm vào giỏ`: Thêm sản phẩm vào giỏ hàng.
  - `Yêu thích`: Đánh dấu sản phẩm yêu thích.
  - `So sánh`: Thêm vào danh sách so sánh (tối đa 2 sản phẩm).

### 5.5. So sánh Laptop (`/compare`)
- Chọn tối đa **2 laptop** từ trang chi tiết sản phẩm.
- Thanh so sánh (CompareBar) hiển thị ở dưới cùng màn hình.
- Nhấn **"So sánh ngay"** → Xem bảng so sánh chi tiết thông số 2 laptop.
- Dữ liệu so sánh được lưu trong `localStorage`.

### 5.6. Giỏ hàng (`/cart/:id`)
- Xem danh sách sản phẩm đã thêm.
- **Chọn sản phẩm** muốn thanh toán (checkbox).
- **Tăng/giảm số lượng** từng sản phẩm.
- **Xóa** sản phẩm đơn lẻ hoặc xóa tất cả.
- **Nhập mã giảm giá** (voucher) → Nhấn "Áp dụng".
- Hệ thống tự tính: Tạm tính + Phí vận chuyển - Giảm giá = **Tổng cộng**.
- Miễn phí vận chuyển cho đơn hàng từ **1.000.000đ**.
- Nhấn **"Tiến hành thanh toán"** để chuyển đến trang xác nhận.

### 5.7. Xác nhận đặt hàng (`/checkout`)
- Nhập thông tin giao hàng: Họ tên, email, SĐT, địa chỉ.
- Chọn Tỉnh/Thành phố → Quận/Huyện → Phường/Xã (dữ liệu từ API).
- Chọn phương thức thanh toán:
  - **VNPAY**: Thanh toán online qua cổng VNPAY.
  - **COD**: Thanh toán khi nhận hàng.
  - **IN_APP**: Thanh toán bằng số dư ví TechWallet.
- Nhấn **"Hoàn tất đặt hàng"** → Hệ thống xử lý và chuyển hướng.

### 5.8. Đặt hàng thành công (`/result`)
- Hiển thị thông báo đặt hàng thành công với hiệu ứng pháo hoa (confetti).

### 5.9. Lịch sử mua hàng (`/history/:id`)
- Xem danh sách tất cả đơn hàng đã đặt.
- Lọc theo trạng thái: Chờ xác nhận, Đang giao, Đã giao, Đã hủy, Hoàn tiền.
- **Hủy đơn**: Hủy đơn hàng chưa xác nhận.
- **Yêu cầu hoàn tiền**: Gửi yêu cầu hoàn tiền cho đơn đã giao.

### 5.10. Mã giảm giá (`/voucher`)
- Xem danh sách voucher đang hoạt động.
- Copy mã để sử dụng khi thanh toán.

### 5.11. Ví TechWallet (`/wallet/:id`)
- Xem số dư ví.
- Gửi yêu cầu rút tiền về tài khoản ngân hàng.

### 5.12. Lịch sử rút tiền (`/wallet-history/:id`)
- Xem danh sách các yêu cầu rút tiền đã gửi.
- Trạng thái: Chờ duyệt, Đã duyệt, Từ chối.

### 5.13. Chatbot AI tư vấn
- Nhấn nút **robot AI** ở góc dưới trang chủ.
- Nhập yêu cầu, ví dụ: "Laptop gaming dưới 25 triệu".
- Bot AI phân tích nhu cầu và **gợi ý sản phẩm** phù hợp kèm thông số và giá.
- Có lưu **lịch sử chat** và gợi ý câu hỏi mẫu.
- API: `POST /api/bot` (gửi tin nhắn), `GET /api/bot/history` (lấy lịch sử).

### 5.14. Chat hỗ trợ trực tiếp
- Nhấn **icon chat** ở góc dưới bên phải trang chủ.
- Chat **realtime** với nhân viên hỗ trợ qua WebSocket (`/ws`).
- Lưu lịch sử tin nhắn, hỗ trợ phân trang.

### 5.15. Đổi mật khẩu
- Vào menu User → **"Đổi mật khẩu"**.
- Nhập mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới.

---

## 6. HƯỚNG DẪN SỬ DỤNG CHO QUẢN TRỊ VIÊN (ADMIN)

> **Lưu ý**: Chỉ tài khoản có role **ADMIN** mới truy cập được các trang quản trị. Nếu không phải Admin, hệ thống tự động chuyển về trang chủ.

### 6.1. Dashboard (`/admin/dashboard`)
- **Thống kê tổng quan**: Tổng doanh thu, tổng đơn hàng, tổng người dùng.
- **Biểu đồ doanh thu** theo tháng (Chart.js/Recharts).
- Chọn năm để xem doanh thu từng tháng.

### 6.2. Quản lý người dùng (`/admin/users`)
- Xem danh sách người dùng (phân trang, tìm kiếm, sắp xếp).
- **Khóa/Mở khóa** tài khoản người dùng.

### 6.3. Quản lý nhãn hàng (`/admin/brands`)
- Xem, thêm, sửa, xóa nhãn hàng laptop (Dell, Asus, HP, Lenovo...).
- Tìm kiếm, phân trang.

### 6.4. Quản lý thể loại (`/admin/categories`)
- Xem, thêm, sửa, xóa thể loại laptop (Gaming, Văn phòng, Đồ họa...).
- Tìm kiếm, phân trang.

### 6.5. Quản lý sản phẩm Laptop (`/admin/laptops`)
- **Danh sách**: Xem tất cả laptop, tìm kiếm theo tên, lọc theo nhãn hàng/thể loại.
- **Thêm mới** (`/admin/laptops/create`):
  - Nhập thông tin chung: tên, mô tả, nhãn hàng, thể loại.
  - Nhập thông số chi tiết: màn hình, pin, cổng kết nối, bàn phím, bảo mật...
  - Thêm **cấu hình** (Options): CPU, RAM, ổ cứng, GPU, giá.
  - Thêm **biến thể** (Variants): Màu sắc, chênh lệch giá, ảnh.
  - Upload nhiều ảnh sản phẩm.
- **Sửa** (`/admin/laptops/update/:id`): Cập nhật thông tin sản phẩm.
- **Xem chi tiết** (`/admin/laptops/detail/:id`): Xem đầy đủ thông tin.
- **Xóa**: Xóa sản phẩm.

### 6.6. Quản lý mã giảm giá (`/admin/discounts`)
- Xem, thêm, sửa, xóa mã giảm giá (voucher).
- Thông tin voucher: mã code, loại giảm (% hoặc số tiền cố định), ngày bắt đầu/kết thúc, số lượng.

### 6.7. Quản lý đơn hàng (`/admin/orders`)
- Xem danh sách đơn hàng, lọc theo:
  - Trạng thái đơn (Chờ xác nhận, Đang giao, Đã giao, Đã hủy...).
  - Phương thức thanh toán (COD, VNPAY, IN_APP).
  - Trạng thái thanh toán.
  - Khoảng thời gian.
- **Cập nhật trạng thái** đơn hàng.
- **Duyệt yêu cầu hoàn tiền** từ khách hàng.

### 6.8. Quản lý rút tiền (`/admin/withdrawals`)
- Xem danh sách yêu cầu rút tiền từ người dùng.
- **Duyệt/Từ chối** yêu cầu rút tiền.

### 6.9. Hỗ trợ khách hàng (`/admin/message`)
- Chat **realtime** với khách hàng qua WebSocket.
- Xem danh sách khách hàng đang cần hỗ trợ.
- Trả lời tin nhắn trực tiếp.

---

## 7. LUỒNG HOẠT ĐỘNG CHÍNH

### Luồng mua hàng:
```
Trang chủ → Tìm kiếm/Xem sản phẩm → Xem chi tiết → Chọn cấu hình + Màu sắc
→ Thêm vào giỏ hàng → Nhập mã giảm giá (nếu có) → Tiến hành thanh toán
→ Nhập thông tin giao hàng → Chọn phương thức thanh toán → Hoàn tất đặt hàng
→ Trang đặt hàng thành công
```

### Luồng quản trị:
```
Đăng nhập (role ADMIN) → Truy cập /admin/dashboard → Xem thống kê
→ Quản lý sản phẩm/đơn hàng/người dùng/voucher/rút tiền
→ Hỗ trợ khách hàng qua chat
```

---

## 8. DANH SÁCH API CHÍNH

| Module | API Endpoint | Mô tả |
|---|---|---|
| **Xác thực** | `POST /api/v1/auth/login` | Đăng nhập |
| | `POST /api/v1/auth/register` | Đăng ký |
| | `POST /api/v1/auth/change-password` | Đổi mật khẩu |
| **Sản phẩm** | `GET /api/v1/products/page` | Tìm kiếm/lọc sản phẩm |
| | `GET /api/v1/products/detail/:id` | Chi tiết sản phẩm |
| | `GET /api/v1/products/feature` | Sản phẩm nổi bật |
| **Giỏ hàng** | `GET /api/v1/cart/:userId` | Lấy giỏ hàng |
| | `POST /api/v1/cart/insert` | Thêm vào giỏ |
| | `POST /api/v1/cart/update` | Cập nhật số lượng |
| | `DELETE /api/v1/cart` | Xóa sản phẩm |
| **Đơn hàng** | `POST /api/v1/order` | Tạo đơn hàng |
| | `GET /api/v1/order/history/:userId` | Lịch sử đơn hàng |
| | `PUT /api/v1/order/cancel/:id` | Hủy đơn |
| | `PUT /api/v1/order/refund/:id` | Yêu cầu hoàn tiền |
| **Thanh toán** | `POST /api/v1/payments/create` | Tạo URL thanh toán VNPAY |
| **Chatbot AI** | `POST /api/bot` | Gửi tin nhắn cho AI |
| | `GET /api/bot/history` | Lịch sử chat AI |
| **Chat hỗ trợ** | WebSocket `/ws` | Chat realtime |
| **Đánh giá** | `POST /api/v1/ratings` | Gửi đánh giá |
| **Voucher** | `GET /api/v1/vouchers` | Danh sách mã giảm giá |
| **Địa chỉ** | `GET /api/v1/location/provinces` | Tỉnh/Thành phố |

---

## 9. PHÂN QUYỀN HỆ THỐNG

| Vai trò | Quyền truy cập |
|---|---|
| **Khách (chưa đăng nhập)** | Xem trang chủ, tìm kiếm, xem chi tiết sản phẩm, so sánh |
| **Người dùng (USER)** | Tất cả quyền khách + Mua hàng, giỏ hàng, chat, đánh giá, ví tiền |
| **Quản trị viên (ADMIN)** | Tất cả quyền USER + Truy cập trang /admin, quản lý toàn bộ hệ thống |

---

## 10. LƯU Ý QUAN TRỌNG

1. **Backend bắt buộc phải chạy** tại `http://localhost:8081` trước khi sử dụng Frontend.
2. **Token xác thực** được lưu trong `localStorage` với key `accessToken`.
3. **Thông tin người dùng** lưu trong `localStorage` với key `USER_LOGIN`.
4. **So sánh laptop** lưu trong `localStorage` với key `COMPARE_LIST` (tối đa 2 sản phẩm).
5. Hệ thống sử dụng **WebSocket** cho tính năng chat realtime (port 8081, endpoint `/ws`).
6. Thanh toán VNPAY sẽ chuyển hướng đến trang thanh toán của VNPAY, sau đó quay lại website.

---

*Tài liệu được tạo tự động từ mã nguồn project FE_Laptop-master.*
