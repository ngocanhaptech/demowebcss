### Boilerplate Phusion Passenger


my_django_project/       <-- Application Root (thư mục gốc trên hosting)
├── core/                <-- Thư mục chứa settings.py, wsgi.py
├── apps/                <-- Chứa các app của bạn (blog, products, v.v.)
├── static/              <-- Chứa ảnh, css, js gốc (development)
├── staticfiles/         <-- Nơi chạy collectstatic sẽ gom file về đây
├── templates/           <-- Chứa các file HTML chung
├── .env                 <-- Lưu biến môi trường (CỰC KỲ QUAN TRỌNG)
├── manage.py
├── passenger_wsgi.py    <-- File mồi cho cPanel
└── requirements.txt