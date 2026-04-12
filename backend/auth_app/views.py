from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    CreateStaffSerializer,
    ResetPasswordSerializer,
)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def staff_list_view(request):
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized.'}, status=403)
    if request.method == 'GET':
        return Response(UserSerializer(User.objects.filter(role='staff'), many=True).data)
    serializer = CreateStaffSerializer(data=request.data)
    if serializer.is_valid():
        staff = serializer.save()
        return Response(UserSerializer(staff).data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def staff_detail_view(request, pk):
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized.'}, status=403)
    try:
        staff = User.objects.get(pk=pk, role='staff')
    except User.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)
    if request.method == 'PUT':
        staff.name     = request.data.get('name',     staff.name)
        staff.username = request.data.get('username', staff.username)
        staff.save()
        return Response(UserSerializer(staff).data)
    staff.delete()
    return Response({'message': 'Deleted.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_staff_password_view(request, pk):
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized.'}, status=403)
    try:
        staff = User.objects.get(pk=pk, role='staff')
    except User.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)
    s = ResetPasswordSerializer(data=request.data)
    if s.is_valid():
        staff.set_password(s.validated_data['new_password'])
        staff.save()
        return Response({'message': 'Password reset.'})
    return Response(s.errors, status=400)