from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsSellerUser(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'seller')

class IsCustomerUser(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'profile') and not hasattr(request.user, 'seller')


class IsStaffOrSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))