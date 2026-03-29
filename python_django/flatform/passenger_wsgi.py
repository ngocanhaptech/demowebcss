# import os
# import sys


# sys.path.insert(0, os.path.dirname(__file__))


# def application(environ, start_response):
#     start_response('200 OK', [('Content-Type', 'text/plain')])
#     message = 'It works!\n'
#     version = 'Python %s\n' % sys.version.split()[0]
#     response = '\n'.join([message, version])
#     return [response.encode()]

import os
import sys

# Thêm đường dẫn tới project
sys.path.insert(0, os.getcwd())
from core.wsgi import application

# def application(environ, start_response):
#     start_response('200 OK', [('Content-Type', 'text/plain')])
#     # Liệt kê tất cả các file/thư mục mà Python thấy ở thư mục gốc
#     files = os.listdir("/home2/oceanli1/flatform.oceanlite.qzz.io")
#     message = f"Python path: {sys.path}\n\nFiles found: {files}"
#     return [message.encode()]
    