1. Định hình Vai trò (Role)

"Hãy đóng vai là một Chuyên gia Lập trình WordPress và chuyên gia phát triển Theme Flatsome (Flatsome UX Builder Expert) với hơn 10 năm kinh nghiệm. Bạn nắm vững các tiêu chuẩn code của WordPress (WordPress Coding Standards) và hệ thống API của Flatsome UX Builder."

2. Mục tiêu cốt lõi (Task/Goal)

"Nhiệm vụ của bạn là giúp tôi chuyển đổi các file giao diện tĩnh (HTML, CSS, JS) mà tôi cung cấp dưới đây thành một Plugin WordPress hoàn chỉnh. Plugin này sẽ tạo ra một shortcode tùy chỉnh và tích hợp trực tiếp shortcode đó vào trong giao diện kéo thả UX Builder của Flatsome."

3. Thông tin dự án (Project Info)

Tên Plugin: "Flatsome Logos Marquee"

Tiền tố (Prefix): "flomar_"

Tên Shortcode: [Nhập tag của shortcode, ví dụ: "logos_marquee"]

4. Dữ liệu đầu vào (Inputs)

Dưới đây là mã nguồn tĩnh (hoặc tôi đã đính kèm file tĩnh trong cửa sổ chat này). Hãy phân tích kỹ:

HTML: "Xem file đính kèm index.html"

CSS: "Xem file đính kèm style.css"

JS: "Xem file đính kèm script.js"

5. Yêu cầu Kỹ thuật Chi tiết (Constraints & Requirements)

Vui lòng viết code tuân thủ nghiêm ngặt các yêu cầu sau:

A. Cấu trúc Plugin:

Tạo cấu trúc thư mục chuẩn (gồm file main php, thư mục /assets/css, /assets/js).

Viết comment header chuẩn của WordPress plugin.

B. Enqueue Scripts & Styles:

Sử dụng wp_enqueue_script và wp_enqueue_style đúng cách.

Chỉ load CSS/JS khi shortcode này được gọi trên trang (để tối ưu tốc độ) hoặc load trong hàm riêng của UX Builder nếu cần.

C. Tạo Shortcode (add_shortcode):

Chuyển đổi HTML tĩnh thành mã PHP linh hoạt.

Trích xuất các nội dung text, hình ảnh hoặc link từ HTML thành các Attributes (thuộc tính) của shortcode để người dùng có thể thay đổi (Ví dụ: title, description, image_url).
Các thuộc tính bắt buộc:
- image_url: images từ người dùng tải lên không giới hạn tải lên
- link_images : các images nếu có ảnh được chọn thì hiển thị options links

D. Tích hợp Flatsome UX Builder (QUAN TRỌNG NHẤT):

Sử dụng hàm add_ux_builder_shortcode('tên_shortcode', array(...)) để đăng ký element này vào Flatsome UX Builder.

Phân loại element này vào category: "Custom Elements".

Ánh xạ (Map) các attributes của shortcode thành các trường nhập liệu (options) trong UX Builder (như textfield, textarea, image, colorpicker...).