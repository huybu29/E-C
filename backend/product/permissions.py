from rest_framework.permissions import BasePermission
class IsSellerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Cho phép mọi người đọc, chỉ seller mới tạo/sửa/xóa
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return hasattr(request.user, 'seller')

    def has_object_permission(self, request, view, obj):
        # seller chỉ thao tác trên sản phẩm của mình
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return obj.seller.user == request.user