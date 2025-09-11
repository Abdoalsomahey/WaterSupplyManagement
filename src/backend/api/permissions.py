from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsAccountant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'accountant'

class IsDriver(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'driver'
    
# # Group
# class IsAdminGroup(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return (
#             request.user.is_authenticated 
#             and request.user.groups.filter(name='Admin').exists()
#         )

# class IsManagerGroup(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return (
#             request.user.is_authenticated 
#             and request.user.groups.filter(name='Manager').exists()
#         )

# class IsAccountantGroup(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return (
#             request.user.is_authenticated 
#             and request.user.groups.filter(name='Accountant').exists()
#         )

# class IsDriverGroup(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return (
#             request.user.is_authenticated 
#             and request.user.groups.filter(name='Driver').exists()
#         )