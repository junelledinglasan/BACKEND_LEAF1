from django.contrib import admin
from .models import Member

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display  = ['member_id','lastname','firstname','status','is_official','share_capital','date_registered']
    list_filter   = ['status','is_official','gender']
    search_fields = ['member_id','firstname','lastname','contact']
    ordering      = ['-date_registered']