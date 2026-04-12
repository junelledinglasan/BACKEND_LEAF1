from django.urls import path
from .views import application_list_view, application_detail_view, loan_list_view, loan_detail_view

urlpatterns = [
    path('applications/',          application_list_view,   name='app-list'),
    path('applications/<int:pk>/', application_detail_view, name='app-detail'),
    path('',                       loan_list_view,          name='loan-list'),
    path('<int:pk>/',              loan_detail_view,        name='loan-detail'),
]