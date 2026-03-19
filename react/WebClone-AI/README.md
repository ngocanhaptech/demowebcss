WebClone AI

TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD) - PHIÊN BẢN MVP
Tên dự án (Tạm gọi): WebClone AI
Nền tảng: Web App (ReactJS)
Mô hình AI: Google Gemini API
Người lập: [Tên của bạn / PM]
Trạng thái: Bản thảo MVP (Draft)

1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
1.1. Vấn đề (The Problem)
Những người làm nội dung (Content creator), chạy quảng cáo (Ads Marketer) hoặc nhân viên văn phòng thường mất rất nhiều thời gian chờ đợi đội ngũ Design/Dev để tạo ra các trang Landing page hoặc các giao diện trình bày bằng HTML. Họ thấy một mẫu (section) rất đẹp trên mạng nhưng không biết cách lấy về và thay đổi nội dung của mình vào đó.

1.2. Giải pháp & USP (The Solution & Unique Selling Proposition)
WebClone AI là một ứng dụng Web dựa trên giao diện Chat, cho phép người dùng sử dụng AI để "clone" (sao chép) các phần tử/section (HTML/CSS/JS) từ một website bất kỳ.
USP: Tính năng tự động đọc hiểu bố cục HTML đã clone và tự động "điền" nội dung mới (văn bản, hình ảnh) do người dùng cung cấp vào đúng vị trí mà không làm vỡ giao diện.

2. CHỈ SỐ ĐO LƯỜNG THÀNH CÔNG (SUCCESS METRICS)
Do phần trả lời của bạn bị ngắt quãng, tôi đề xuất các chỉ số MVP như sau:

Thời gian tiết kiệm (Time-to-value): Giảm thời gian tạo một section/landing page từ vài giờ (chờ design) xuống dưới 5 phút.

Tỷ lệ thao tác thành công (Task Success Rate): >80% người dùng có thể export (xuất) được file HTML hoàn chỉnh sau khi chat với AI.

Tỷ lệ giữ chân (Retention Rate): Số lượng người dùng quay lại sử dụng tool trong vòng 7 ngày kể từ lần đầu tiên.

3. CHÂN DUNG NGƯỜI DÙNG (USER PERSONA)
Đối tượng: Dân làm Content cho Website, Landing page; Nhân viên chạy Ads (Cần test nhanh nhiều mẫu trang đích); Nhân viên văn phòng cần trình bày báo cáo bằng giao diện web thay cho slide khô khan.

Hành vi/Đặc điểm: Thường xuyên sử dụng công nghệ, quen thuộc với các công cụ chat AI (ChatGPT, Gemini). Hiểu biết cơ bản về web nhưng không rành code (hoặc không muốn tự code).

Mục tiêu: Nhanh, chuẩn xác, tự chủ công việc, bỏ qua bước chờ đợi Designer/Coder.

4. CÁC TÍNH NĂNG CỐT LÕI (MVP CORE FEATURES)
Epic 1: Lấy mẫu & Sinh mã HTML (Clone & Generate)
Feature 1.1 - Smart Clone qua Chat: Người dùng nhập dán đoạn mã HTML/CSS/JS mẫu (hoặc nhập URL) vào khung chat và yêu cầu vị trí cần lấy (VD: "Lấy cho tôi phần Pricing Table của đoạn code này"). AI bóc tách chính xác phần tử đó.

Feature 1.2 - Generate from Idea: Khả năng sinh mã HTML/CSS/JS nhanh dựa trên text prompt (VD: "Tạo cho tôi một nút Call-to-action màu đỏ có hiệu ứng hover").

Epic 2: Tự động điền nội dung (AI Auto-Fill Content)
Feature 2.1 - Smart Content Replacement: Người dùng cung cấp nội dung text mới vào khung chat (VD: "Thay các gói giá thành: Cơ bản 100k, Pro 200k, VIP 500k"). AI tự động tìm đúng thẻ HTML tương ứng để thay chữ mà không làm hỏng cấu trúc CSS/JS.

Epic 3: Trình chỉnh sửa & Phản hồi (Edit & Feedback)
Feature 3.1 - Live Preview (Xem trước trực tiếp): Chia đôi màn hình, một bên là khung Chat, một bên là màn hình Render HTML trực tiếp để người dùng thấy kết quả ngay lập tức.

Feature 3.2 - Manual Code Editor: Nếu AI bị "ảo giác" (hallucination) hoặc thay sai vị trí, người dùng có thể mở tab "Code" để sửa trực tiếp HTML/CSS. Mọi thay đổi sẽ cập nhật ngay lên Live Preview.

5. LUỒNG NGƯỜI DÙNG & GIAO DIỆN (USER FLOW & UI/UX)
5.1. Luồng thao tác chính (Main Flow)
Bước 1: Người dùng đăng nhập vào Web App.

Bước 2: Mở giao diện làm việc (Giao diện chia 2 phần: Trái là Khung Chat, Phải là Live Preview).

Bước 3: Người dùng paste mã HTML gốc và chat: "Clone cho tôi section Giới thiệu từ đoạn code này".

Bước 4: AI bóc tách code, hiển thị giao diện phần Giới thiệu bên màn hình phải.

Bước 5: Người dùng chat tiếp nội dung muốn thay: "Thay tiêu đề thành 'Về chúng tôi', đoạn văn bên dưới là 'Công ty công nghệ ABC...'".

Bước 6: AI thực hiện thay thế. Người dùng xem Live Preview.

Bước 7: Người dùng tinh chỉnh thủ công nếu cần (qua tab Code) -> Bấm "Export" hoặc "Copy Code" để sử dụng.

6. YÊU CẦU HỆ THỐNG & CÔNG NGHỆ (TECH STACK & DATA FLOW)
Front-end: ReactJS (Phù hợp để xây dựng giao diện chia panel phức tạp, live code render giống như CodePen hoặc StackBlitz).

AI Engine: Tích hợp Gemini API (Khuyên dùng dòng model như gemini-1.5-pro vì nó xử lý context (ngữ cảnh) lớn rất tốt, cực kỳ phù hợp để nhồi những đoạn code HTML/CSS dài vào prompt).

Data Input: Dữ liệu text (Prompt), mã code HTML/CSS/JS thô từ người dùng.

Xử lý "Hallucination": Sử dụng System Prompt chặt chẽ cho Gemini: "Bạn là một chuyên gia Frontend. Chỉ trả về mã code, tuyệt đối không giải thích dài dòng. Không tự ý xóa các class CSS có sẵn của người dùng."

7. CÁC RỦI RO & HƯỚNG GIẢI QUYẾT (RISKS & MITIGATIONS)
Giới hạn token của AI: Website HTML rất dài có thể vượt quá giới hạn ngữ cảnh của API.

Giải pháp: Hướng dẫn người dùng chỉ copy paste phần tử khoanh vùng cần thiết, thay vì paste toàn bộ source code của 1 website.

Code sinh ra chứa mã độc (JS injection):

Giải pháp: Có cơ chế sanitize HTML trước khi render lên Live Preview để tránh các lỗi bảo mật XSS cho nền tảng web app của chúng ta.