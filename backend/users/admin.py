from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FarmerProfile, BuyerProfile, TransporterProfile, EquipmentProviderProfile, EmailOTP

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(FarmerProfile)
admin.site.register(BuyerProfile)
admin.site.register(TransporterProfile)
admin.site.register(EquipmentProviderProfile)

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('email',)
    readonly_fields = ('created_at',)
