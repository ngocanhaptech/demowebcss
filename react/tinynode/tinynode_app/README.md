tinynode/
├─ index.html           (giữ nguyên của Vite)
├─ package.json
├─ vite.config.js       (giữ nguyên của Vite)
├─ tailwind.config.cjs  (sẽ sửa nội dung)
├─ postcss.config.cjs   (sẽ sửa nội dung)
└─ src/
   ├─ main.jsx          (sẽ sửa nhẹ)
   ├─ App.jsx           (tạo mới)
   └─ index.css         (tạo/sửa)

TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD): TINYNODE - GIA SƯ AI & VÍ GEM

1. Tổng quan dự án



Tên App: TinyNode

Nền tảng: Mobile Web (Tối ưu hiển thị trên màn hình điện thoại).

Mục tiêu: Tạo ra một môi trường học tập tự động, nơi AI đóng vai trò gia sư hướng dẫn và chấm bài, hệ thống tự động thưởng Gem, và phụ huynh đóng vai trò quản lý phần thưởng thực tế.

2. Công nghệ sử dụng (Tech Stack cho MVP nhẹ nhất)



Frontend (Giao diện): React.js (Next.js hoặc Vite) + Tailwind CSS (để làm giao diện hoạt hình bo góc, màu sắc tươi sáng dễ dàng).

Backend & AI: Node.js hoặc gọi trực tiếp API từ Frontend.

AI Engine: Google Gemini API (Dùng tính năng Chat và Vision để đọc ảnh).

Database: Google Sheets API (Làm cơ sở dữ liệu lưu log điểm và chat).

3. Đối tượng người dùng & Quyền hạn



Chế độ Học sinh (Kid Mode): Chat hỏi bài, chụp ảnh nộp bài, xem số dư Gem hiện tại. Không có quyền trừ Gem.

Chế độ Phụ huynh (Parent Mode): Xem lịch sử học, lịch sử cộng Gem, và có nút "Quy đổi quà" (Nhập text mô tả món quà -> Hệ thống trừ Gem và ghi Log).

4. Luồng tính năng cốt lõi (User Flows)



Flow 1 - Gia sư AI (Học sinh): Giao diện chat thân thiện. Học sinh gõ câu hỏi -> AI trả lời theo phong cách gia sư (gợi ý chứ không giải hộ).

Flow 2 - Nộp bài & Nhận Gem (Học sinh): Bấm nút 📷 (Camera) -> Chụp ảnh bài tập -> AI Gemini Vision phân tích ảnh, chấm điểm -> Nếu đúng/hoàn thành, hiện hiệu ứng chúc mừng và tự động cộng +X Gem vào tài khoản.

Flow 3 - Đổi quà (Phụ huynh): Phụ huynh vào tab Quản lý -> Nhập: "Đổi đi chơi công viên" -> Nhập số Gem bị trừ: "50" -> Bấm xác nhận -> Trừ tổng Gem và lưu vào Google Sheet.

5. Cấu trúc Database (Google Sheets)



Sheet 1 [Users]: Tên, Role (Kid/Parent), Tổng Gem hiện tại.

Sheet 2 [History]: Ngày giờ, Hành động (Nộp bài Toán/Đổi quà đi chơi), Biến động Gem (+10 hoặc -50), Người thực hiện.