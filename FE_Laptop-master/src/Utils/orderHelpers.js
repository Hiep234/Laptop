/**
 * Order amount helpers – dùng chung cho client & admin.
 *
 * Ưu tiên dùng field BE trả về (subTotal, discountAmount, shippingFee, totalAmount, lineTotal).
 * Fallback về logic tính cũ nếu field chưa có.
 */

/**
 * Format tiền VND theo chuẩn Intl.
 * @param {number|string} value
 * @returns {string}
 */
export const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

/**
 * Lấy tổng tiền dòng sản phẩm.
 * Ưu tiên lineTotal từ BE, fallback priceAtOrderTime * quantity.
 * @param {object} item – orderItem object
 * @returns {number}
 */
export const getLineTotal = (item) =>
  Number(item.lineTotal ?? (item.priceAtOrderTime ?? 0) * (item.quantity ?? 0));

/**
 * Tính các khoản tiền tổng hợp cho 1 đơn hàng.
 * Ưu tiên field mới từ BE; fallback về logic tính cũ.
 *
 * @param {object} order – order object từ API
 * @returns {{ subTotal: number, discountAmount: number, shippingFee: number, totalAmount: number }}
 */
export const getOrderAmounts = (order) => {
  const subTotal =
    Number(order.subTotal) ||
    (order.orderItems || []).reduce((sum, item) => sum + getLineTotal(item), 0);

  const discountAmount = Number(order.discountAmount ?? order.discount ?? 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const totalAmount =
    Number(order.totalAmount) || subTotal - discountAmount + shippingFee;

  return {
    subTotal,
    discountAmount,
    shippingFee,
    totalAmount,
  };
};

/**
 * Helper: lấy text hiển thị trạng thái giao hàng.
 * @param {string} status
 * @returns {string}
 */
export const getShippingStatusText = (status) => {
  const map = {
    ready_to_pick: "Chờ lấy hàng",
    picking: "Đang lấy hàng",
    cancel: "Đã hủy",
    money_collect_picking: "Thu tiền khi lấy hàng",
    picked: "Đã lấy hàng",
    storing: "Đang lưu kho",
    transporting: "Đang vận chuyển",
    sorting: "Đang phân loại",
    delivering: "Đang giao hàng",
    money_collect_delivering: "Thu tiền khi giao hàng",
    delivered: "Đã giao hàng",
    delivery_fail: "Giao hàng thất bại",
    waiting_to_return: "Chờ trả hàng",
    return: "Trả hàng",
    return_transporting: "Đang vận chuyển trả hàng",
    return_sorting: "Đang phân loại trả hàng",
    returning: "Đang trả hàng",
    return_fail: "Trả hàng thất bại",
    returned: "Đã trả hàng",
    exception: "Ngoại lệ",
    damage: "Hàng hư hỏng",
    lost: "Hàng bị mất",
  };
  return map[status?.toLowerCase()] || status || "";
};
