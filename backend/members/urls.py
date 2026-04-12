from django.urls import path
from .views import member_list_view, member_detail_view, member_status_view, member_stats_view

urlpatterns = [
    path('',                 member_list_view,   name='member-list'),
    path('stats/',           member_stats_view,  name='member-stats'),
    path('<int:pk>/',        member_detail_view, name='member-detail'),
    path('<int:pk>/status/', member_status_view, name='member-status'),
]