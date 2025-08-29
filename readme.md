# Project E-commerce React + Django

Một sàn thương mại điện tử đơn giản với các tính năng:
- Quản lý người dùng (Khách hàng / Người bán / Admin)
- Quản lý sản phẩm: tạo, sửa, xóa, xem chi tiết
- Giỏ hàng và đặt hàng
- Thanh toán cơ bản
- Frontend React kết nối API Django

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Sử dụng](#sử-dụng)
- [API](#api)
- [Công nghệ](#công-nghệ)
- [Đóng góp](#đóng-góp)
- [License](#license)

## Giới thiệu
Project này là một sàn thương mại điện tử, nơi người bán có thể đăng sản phẩm, người mua có thể thêm sản phẩm vào giỏ hàng, đặt hàng và thanh toán.  
Backend sử dụng Django + Django REST Framework, frontend xây dựng bằng React.

## Cài đặt

### Backend
1. Clone repository:
```bash
git clone https://github.com/huybu29/E-C.git
cd E-C/backend
python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
cd E-C/frontend
npm install
npm start