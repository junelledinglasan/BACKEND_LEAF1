from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Member
from .serializers import MemberSerializer, MemberListSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def member_list_view(request):
    if request.method == 'GET':
        qs = Member.objects.all()
        if s := request.query_params.get('status'):  qs = qs.filter(status=s)
        if o := request.query_params.get('is_official'): qs = qs.filter(is_official=o=='true')
        if q := request.query_params.get('search','').strip():
            qs = qs.filter(lastname__icontains=q) | qs.filter(firstname__icontains=q) | qs.filter(member_id__icontains=q)
        return Response(MemberListSerializer(qs, many=True).data)

    if request.user.role not in ['admin','staff']:
        return Response({'error':'Unauthorized.'}, status=403)
    s = MemberSerializer(data=request.data)
    if s.is_valid():
        m = s.save(is_official=True, status='Active')
        return Response(MemberSerializer(m).data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def member_detail_view(request, pk):
    try: m = Member.objects.get(pk=pk)
    except Member.DoesNotExist: return Response({'error':'Not found.'}, status=404)

    if request.method == 'GET':
        return Response(MemberSerializer(m).data)
    if request.method == 'PUT':
        if request.user.role not in ['admin','staff']: return Response({'error':'Unauthorized.'}, status=403)
        s = MemberSerializer(m, data=request.data, partial=True)
        if s.is_valid(): s.save(); return Response(s.data)
        return Response(s.errors, status=400)
    if request.user.role != 'admin': return Response({'error':'Unauthorized.'}, status=403)
    m.delete()
    return Response({'message':'Deleted.'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def member_status_view(request, pk):
    if request.user.role not in ['admin','staff']: return Response({'error':'Unauthorized.'}, status=403)
    try: m = Member.objects.get(pk=pk)
    except Member.DoesNotExist: return Response({'error':'Not found.'}, status=404)
    if st := request.data.get('status'): m.status = st
    if o := request.data.get('is_official'): m.is_official = o
    m.save()
    return Response(MemberSerializer(m).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_stats_view(request):
    return Response({
        'total':     Member.objects.count(),
        'active':    Member.objects.filter(status='Active').count(),
        'inactive':  Member.objects.filter(status='Inactive').count(),
        'suspended': Member.objects.filter(status='Suspended').count(),
        'pending':   Member.objects.filter(is_official=False).count(),
    })