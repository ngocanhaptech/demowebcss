import os
import sys
from django.core.wsgi import get_wsgi_application

# 1. Định nghĩa đường dẫn gốc của project
# Điều này giúp Django tìm thấy các app khác trong project của bạn
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

# 2. Thiết lập biến môi trường trỏ đến file settings.py
# Đảm bảo 'core.settings' khớp với tên thư mục chứa file settings.py của bạn
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# 3. Khởi tạo WSGI Application
try:
    application = get_wsgi_application()
except Exception as e:
    # Đoạn này cực kỳ hữu ích để debug trên Hosting: 
    # Nếu Django lỗi (ví dụ sai DB), nó sẽ ghi vào file stderr.log
    with open(os.path.join(BASE_DIR, "stderr.log"), "a") as f:
        f.write(f"WSGI Error: {str(e)}\n")
    raise e