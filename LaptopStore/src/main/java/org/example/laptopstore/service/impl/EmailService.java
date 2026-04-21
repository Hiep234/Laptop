package org.example.laptopstore.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.example.laptopstore.entity.OrderItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@RequiredArgsConstructor
@Service
public class EmailService {
    private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);
    private static final String FROM_EMAIL = "tbquoc.jvb@gmail.com";
    private static final String CURRENCY_LOCALE = "vi_VN";
    private static final String ENCODING = "UTF-8";

    private final JavaMailSender mailSender;

    public void sendPaymentTimeoutNotification(String recipientEmail, String customerName,
                                               String orderId, String expiryTime, List<OrderItem> items) {
        try {
            String subject = String.format("Thông báo: Đơn hàng #%s đã hết hạn thanh toán", orderId);
            String content = buildPaymentTimeoutEmailContent(customerName, orderId, expiryTime, items);

            MimeMessage message = createEmailMessage(recipientEmail, subject, content);
            mailSender.send(message);

            LOGGER.info("Successfully sent payment timeout email to: {}", recipientEmail);
        } catch (MessagingException e) {
            LOGGER.error("Failed to send payment timeout email to: {}", recipientEmail, e);
        }
    }

    private MimeMessage createEmailMessage(String recipientEmail, String subject, String content)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, ENCODING);

        helper.setFrom(FROM_EMAIL);
        helper.setTo(recipientEmail.trim());
        helper.setSubject(subject);
        helper.setText(content, true);

        return message;
    }

    private String buildPaymentTimeoutEmailContent(String customerName, String orderId,
                                                   String expiryTime, List<OrderItem> items) {
        NumberFormat currencyFormatter = getVietnameseCurrencyFormatter();
        String productRows = buildProductTableRows(items, currencyFormatter);
        BigDecimal total = calculateTotalAmount(items);

        return EmailTemplates.PAYMENT_TIMEOUT_TEMPLATE
                .replace("${customerName}", customerName)
                .replace("${orderId}", orderId)
                .replace("${expiryTime}", expiryTime)
                .replace("${productRows}", productRows)
                .replace("${totalAmount}", currencyFormatter.format(total))
                .replace("${orderLink}", "https://yourwebsite.com/orders"); // Thay bằng link thực tế
    }

    private NumberFormat getVietnameseCurrencyFormatter() {
        NumberFormat format = NumberFormat.getCurrencyInstance(new Locale(CURRENCY_LOCALE));
        format.setMaximumFractionDigits(0); // Bỏ phần thập phân
        return format;
    }

    private String buildProductTableRows(List<OrderItem> items, NumberFormat currencyFormat) {
        StringBuilder rows = new StringBuilder();

        items.forEach(item -> rows.append(buildProductRow(item, currencyFormat)));
        rows.append(buildTotalRow(items, currencyFormat));

        return rows.toString();
    }

    private String buildProductRow(OrderItem item, NumberFormat currencyFormat) {
        String formattedPrice = currencyFormat.format(item.getPriceAtOrderTime())
                .replace("₫", "") // Bỏ ký hiệu tiền tệ
                .trim();

        String formattedTotal = currencyFormat.format(
                        item.getPriceAtOrderTime().multiply(BigDecimal.valueOf(item.getQuantity())))
                .replace("₫", "")
                .trim();

        return String.format(
                "<tr>" +
                        "  <td style=\"display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid #eee;\">" +
                        "    <img src=\"%s\" class=\"product-img\" alt=\"Product image\" style=\"width: 60px; height: 60px; object-fit: contain; border-radius: 4px;\">" +
                        "    <div style=\"margin-left: 15px;\">" +
                        "      <div style=\"font-weight: 500;\">%s</div>" +
                        "      <div style=\"font-size: 13px; color: #777;\">Mã SP: %s</div>" +
                        "    </div>" +
                        "  </td>" +
                        "  <td style=\"padding: 12px 15px; border-bottom: 1px solid #eee;\"><span style=\"color: #e53935;\">%s₫</span></td>" +
                        "  <td style=\"padding: 12px 15px; border-bottom: 1px solid #eee;\">%d</td>" +
                        "  <td style=\"padding: 12px 15px; border-bottom: 1px solid #eee;\"><span style=\"color: #e53935; font-weight: 500;\">%s₫</span></td>" +
                        "</tr>",
                item.getProductVariant().getImageUrl(),
                item.getProductName(),
                item.getProductCode() + ", " + item.getProductVariant().getOption().getCpu() + ", " + item.getProductVariant().getOption().getGpu() + ", " + item.getProductVariant().getOption().getRam() + ", " + item.getProductVariant().getColor() ,
                formattedPrice,
                item.getQuantity(),
                formattedTotal
        );
    }

    private String buildTotalRow(List<OrderItem> items, NumberFormat currencyFormat) {
        BigDecimal total = calculateTotalAmount(items);
        String formattedTotal = currencyFormat.format(total)
                .replace("₫", "")
                .trim();

        return String.format(
                "<tr>" +
                        "  <td colspan=\"3\" style=\"text-align: right; font-weight: 600; padding: 12px 15px; border-bottom: 1px solid #eee;\">Tổng cộng:</td>" +
                        "  <td style=\"font-weight: 600; padding: 12px 15px; border-bottom: 1px solid #eee;\"><span style=\"color: #e53935;\">%s₫</span></td>" +
                        "</tr>",
                formattedTotal
        );
    }

    private BigDecimal calculateTotalAmount(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getPriceAtOrderTime().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static class EmailTemplates {
        static final String PAYMENT_TIMEOUT_TEMPLATE = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Thông báo hết hạn thanh toán</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #2c3e50;
                        margin-top: 0;
                    }
                    .header {
                        border-bottom: 1px solid #eee;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        font-size: 14px;
                        color: #777;
                    }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                        font-weight: 500;
                        margin: 15px 0;
                    }
                    .btn:hover {
                        background-color: #45a049;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th {
                        background-color: #f5f5f5;
                        padding: 12px 15px;
                        text-align: left;
                        font-weight: 500;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Xin chào ${customerName},</h2>
                        <p>Đơn hàng <strong>#${orderId}</strong> của bạn đã hết hạn thanh toán vào lúc <strong>${expiryTime}</strong>.</p>
                    </div>
                    
                    <h3 style="margin-bottom: 15px;">Chi tiết đơn hàng:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40%;">Sản phẩm</th>
                                <th style="width: 20%;">Đơn giá</th>
                                <th style="width: 15%;">Số lượng</th>
                                <th style="width: 25%;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productRows}
                        </tbody>
                    </table>
                    
                    <p>Nếu bạn vẫn muốn mua các sản phẩm này, vui lòng đặt hàng lại:</p>
                    <a href="${orderLink}" class="btn">Đặt hàng lại</a>
                    
                    <div class="footer">
                        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
                        <p>Trân trọng,<br><strong>Đội ngũ bán hàng</strong></p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}