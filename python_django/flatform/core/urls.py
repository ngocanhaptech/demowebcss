# core/urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse # Thêm dòng này

# Hàm tạo nội dung trang chủ nhanh
def home_view(request):
    return HttpResponse("<h1>Hệ thống OceanLite đã hoạt động!</h1><p>Vào <a href='/admin/'>Trang quản trị</a></p>")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view), # Thêm dòng này cho trang chủ
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)