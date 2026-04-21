package org.example.laptopstore.util;


import java.util.regex.Pattern;




public class Validation {
    // Pre-compiled pattern for validating emails
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}$"
    );
    private static final String PHONE_REGEX = "^\\d{10}$"; // Số điện thoại là 10 chữ số
    private static final String TAX_CODE_REGEX = "^\\d{10}$"; // Mã số thuế là 10 chữ số
    private static final String NUMBER_REGEX = "\\d+"; // Kiểm tra chỉ là số

    private static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$";


    // Kiểm tra xem chuỗi có phải là email hợp lệ không
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhoneNumber(String phoneNumber) {
        return phoneNumber != null && Pattern.matches(PHONE_REGEX, phoneNumber);
    }

    public static boolean isValidPassword(String password) {
        return password != null && Pattern.matches(PASSWORD_PATTERN, password);
    }

    public static boolean isValidTaxCode(String taxCode) {
        return taxCode != null && Pattern.matches(TAX_CODE_REGEX, taxCode);
    }



    public static String sanitizeKeyword(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return "";
        }

        // Thoát các ký tự đặc biệt trong SQL LIKE
        keyword = keyword.replaceAll("([%_])", "\\\\$1");  // Thoát '%' và '_'
        keyword = keyword.replaceAll("([;'])", "\\\\$1");  // Thoát ';' và '\''
        keyword = keyword.replaceAll("\"", "\\\\\"");     // Thoát dấu nháy kép "
        keyword = keyword.replaceAll("--", "\\\\--");      // Thoát chuỗi '--'
        keyword = keyword.replaceAll("/\\*|\\*/", "");     // Loại bỏ phần chú thích /* */

        // Loại bỏ các từ khóa nguy hiểm trong SQL
        String[] sqlKeywords = {
                "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE",
                "EXEC", "EXECUTE", "UNION", "ALL", "CREATE", "ALTER", "RENAME",
                "REPLACE", "SHUTDOWN", "GRANT", "REVOKE", "MERGE", "CALL",
                "SET", "DECLARE", "FETCH", "OPEN", "CLOSE"
        };

        for (String sqlKeyword : sqlKeywords) {
            keyword = keyword.replaceAll("(?i)\\b" + sqlKeyword + "\\b", ""); // Xóa từ khóa (không phân biệt hoa thường)
        }

        // Loại bỏ các ký tự điều khiển không hợp lệ
        keyword = keyword.replaceAll("[\\x00\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f]", ""); // Ký tự điều khiển

        // Thoát ký tự nguy hiểm để ngăn chặn việc kết thúc chuỗi SQL
        keyword = keyword.replaceAll("(['\"\\\\])", "\\\\$1");

        // Loại bỏ các mẫu tấn công phổ biến
        keyword = keyword.replaceAll("(?i)or\\s+1=1", ""); // Tấn công OR 1=1
        keyword = keyword.replaceAll("(?i)and\\s+1=1", ""); // Tấn công AND 1=1
        keyword = keyword.replaceAll("(?i)union\\s+select", ""); // Tấn công UNION SELECT
        keyword = keyword.replaceAll("(?i)information_schema", ""); // Truy vấn metadata

        return keyword.trim();
    }

    public static String escapeKeywordForQuery(String keyword) {
        if (keyword == null || keyword.isEmpty()) return null;
        keyword = keyword.trim().toLowerCase()
                .replace("\\", "\\\\")
                .replace("_", "\\_")
                .replace("%", '\\' + "%");
        return "%" + keyword + "%";
    }
}
