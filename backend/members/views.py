from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from auth_app.models import User
from .models import Member, MembershipApplication
from .serializers import (
    MemberSerializer, MemberListSerializer,
    MembershipApplicationSerializer, MembershipApplicationListSerializer,
)


# ══════════════════════════════════════════════════════════════════
# MEMBERSHIP APPLICATIONS
# ══════════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
def application_list_view(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=401)
        if request.user.role not in ['admin', 'staff']:
            return Response({'error': 'Unauthorized.'}, status=403)

        apps = MembershipApplication.objects.all()
        if s := request.query_params.get('status'):
            apps = apps.filter(status=s)
        if q := request.query_params.get('search', '').strip():
            apps = apps.filter(lastname__icontains=q) | \
                   apps.filter(firstname__icontains=q) | \
                   apps.filter(app_id__icontains=q)
        return Response(MembershipApplicationListSerializer(apps, many=True).data)

    # POST — public, anyone can submit
    user = request.user if request.user.is_authenticated else None
    s = MembershipApplicationSerializer(data=request.data)
    if s.is_valid():
        app = s.save(user=user)
        return Response(MembershipApplicationSerializer(app).data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def application_detail_view(request, pk):
    try:
        app = MembershipApplication.objects.get(pk=pk)
    except MembershipApplication.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)

    if request.method == 'GET':
        return Response(MembershipApplicationSerializer(app).data)

    if request.user.role not in ['admin', 'staff']:
        return Response({'error': 'Unauthorized.'}, status=403)

    new_status = request.data.get('status')
    if new_status in ['Approved', 'Rejected']:
        app.status      = new_status
        app.reviewed_at = timezone.now()
        app.reviewed_by = request.user.username
        if new_status == 'Rejected':
            app.reject_reason = request.data.get('reject_reason', '')
        app.save()
    return Response(MembershipApplicationSerializer(app).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_application_view(request):
    """Member views their own application status."""
    try:
        app = MembershipApplication.objects.get(user=request.user)
        return Response(MembershipApplicationSerializer(app).data)
    except MembershipApplication.DoesNotExist:
        return Response({'error': 'No application found.'}, status=404)


# ══════════════════════════════════════════════════════════════════
# OFFICIAL MEMBERS
# ══════════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def member_list_view(request):
    if request.method == 'GET':
        members = Member.objects.all()
        if s := request.query_params.get('status'):
            members = members.filter(status=s)
        if q := request.query_params.get('search', '').strip():
            members = members.filter(lastname__icontains=q)  | \
                      members.filter(firstname__icontains=q)  | \
                      members.filter(member_id__icontains=q)
        return Response(MemberListSerializer(members, many=True).data)

    # POST — register official member (admin/staff only)
    if request.user.role not in ['admin', 'staff']:
        return Response({'error': 'Unauthorized.'}, status=403)

    data = request.data.copy()

    # Auto-generate plain password if not provided
    plain_password = data.get('plain_password', '')
    if not plain_password:
        import random, string
        plain_password = 'leaf' + ''.join(random.choices(string.digits, k=4))

    # Get or create user account
    app_id = data.get('application')
    user   = None

    if app_id:
        try:
            app  = MembershipApplication.objects.get(pk=app_id)
            user = app.user
            if user:
                user.role = 'member'
                user.save()
        except MembershipApplication.DoesNotExist:
            pass

    if not user:
        import random, string
        fn   = data.get('firstname', '').lower().strip()
        ln   = data.get('lastname',  '').lower().strip()
        base = f'{fn}.{ln}'
        uname = base
        i = 1
        while User.objects.filter(username=uname).exists():
            uname = f'{base}{i}'; i += 1

        name = f"{data.get('firstname','')} {data.get('lastname','')}".strip()
        user = User.objects.create_user(
            username=uname,
            password=plain_password,
            name=name,
            role='member',
        )

    s = MemberSerializer(data=data)
    if s.is_valid():
        member = s.save(user=user, plain_password=plain_password)
        return Response(MemberSerializer(member).data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def member_detail_view(request, pk):
    try:
        member = Member.objects.get(pk=pk)
    except Member.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)

    if request.method == 'GET':
        return Response(MemberSerializer(member).data)

    if request.method == 'PUT':
        if request.user.role not in ['admin', 'staff']:
            return Response({'error': 'Unauthorized.'}, status=403)
        data  = request.data.copy()
        new_pw = data.get('plain_password', '')
        if new_pw and member.user:
            member.user.set_password(new_pw)
            member.user.save()
        s = MemberSerializer(member, data=data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    if request.method == 'DELETE':
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=403)
        member.delete()
        return Response({'message': 'Member deleted.'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def member_status_view(request, pk):
    if request.user.role not in ['admin', 'staff']:
        return Response({'error': 'Unauthorized.'}, status=403)
    try:
        member = Member.objects.get(pk=pk)
    except Member.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)
    if st := request.data.get('status'):
        member.status = st
    member.save()
    return Response(MemberSerializer(member).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_stats_view(request):
    if request.user.role not in ['admin', 'staff']:
        return Response({'error': 'Unauthorized.'}, status=403)
    return Response({
        'total':                  Member.objects.count(),
        'active':                 Member.objects.filter(status='Active').count(),
        'inactive':               Member.objects.filter(status='Inactive').count(),
        'suspended':              Member.objects.filter(status='Suspended').count(),
        'pending_applications':   MembershipApplication.objects.filter(status='Pending').count(),
        'approved_applications':  MembershipApplication.objects.filter(status='Approved').count(),
        'total_applications':     MembershipApplication.objects.count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile_view(request):
    """Member views their own profile."""
    try:
        member = Member.objects.get(user=request.user)
        return Response(MemberSerializer(member).data)
    except Member.DoesNotExist:
        return Response({'error': 'Not an official member yet.'}, status=404)