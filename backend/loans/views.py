from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import MembershipApplication, Loan
from .serializers import MembershipApplicationSerializer, LoanSerializer, CreateLoanSerializer


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def application_list_view(request):
    if request.method == 'GET':
        qs = MembershipApplication.objects.all()
        if s := request.query_params.get('status'): qs = qs.filter(status=s)
        return Response(MembershipApplicationSerializer(qs, many=True).data)
    s = MembershipApplicationSerializer(data=request.data)
    if s.is_valid(): s.save(); return Response(s.data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET','PATCH'])
@permission_classes([IsAuthenticated])
def application_detail_view(request, pk):
    try: app = MembershipApplication.objects.get(pk=pk)
    except MembershipApplication.DoesNotExist: return Response({'error':'Not found.'}, status=404)
    if request.method == 'GET': return Response(MembershipApplicationSerializer(app).data)
    if request.user.role not in ['admin','staff']: return Response({'error':'Unauthorized.'}, status=403)
    ns = request.data.get('status')
    if ns in ['Approved','Rejected']:
        app.status      = ns
        app.reviewed_at = timezone.now()
        app.reviewed_by = request.user.username
        if ns == 'Rejected': app.reject_reason = request.data.get('reject_reason','')
        app.save()
    return Response(MembershipApplicationSerializer(app).data)


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def loan_list_view(request):
    if request.method == 'GET':
        qs = Loan.objects.all()
        if request.user.role == 'member': qs = qs.filter(member__user=request.user)
        if s := request.query_params.get('status'): qs = qs.filter(status=s)
        return Response(LoanSerializer(qs, many=True).data)
    s = CreateLoanSerializer(data=request.data)
    if s.is_valid(): loan = s.save(); return Response(LoanSerializer(loan).data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET','PATCH'])
@permission_classes([IsAuthenticated])
def loan_detail_view(request, pk):
    try: loan = Loan.objects.get(pk=pk)
    except Loan.DoesNotExist: return Response({'error':'Not found.'}, status=404)
    if request.method == 'GET': return Response(LoanSerializer(loan).data)
    if request.user.role not in ['admin','staff']: return Response({'error':'Unauthorized.'}, status=403)
    if ns := request.data.get('status'):
        loan.status = ns
        if ns == 'Approved':
            loan.approved_at = timezone.now()
            loan.approved_by = request.user.username
        if ns == 'Declined': loan.decline_reason = request.data.get('decline_reason','')
        loan.save()
    return Response(LoanSerializer(loan).data)