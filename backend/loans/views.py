import datetime
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from dateutil.relativedelta import relativedelta

from .models import Loan
from .serializers import LoanSerializer, CreateLoanSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def loan_list_view(request):

    if request.method == 'GET':
        loans = Loan.objects.all()
        if request.user.role == 'member':
            loans = loans.filter(member__user=request.user)
        if s := request.query_params.get('status'):
            loans = loans.filter(status=s)
        if q := request.query_params.get('search', '').strip():
            loans = loans.filter(member__lastname__icontains=q) | \
                    loans.filter(member__firstname__icontains=q) | \
                    loans.filter(loan_id__icontains=q)
        return Response(LoanSerializer(loans, many=True).data)

    s = CreateLoanSerializer(data=request.data)
    if s.is_valid():
        loan = s.save()
        return Response(LoanSerializer(loan).data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def loan_detail_view(request, pk):
    try:
        loan = Loan.objects.get(pk=pk)
    except Loan.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)

    if request.method == 'GET':
        return Response(LoanSerializer(loan).data)

    if request.user.role not in ['admin', 'staff']:
        return Response({'error': 'Unauthorized.'}, status=403)

    new_status = request.data.get('status')
    if new_status:
        loan.status = new_status
        if new_status == 'Approved':
            loan.approved_at   = timezone.now()
            loan.approved_by   = request.user.username
            loan.next_due_date = datetime.date.today() + relativedelta(months=1)
        if new_status == 'Declined':
            loan.decline_reason = request.data.get('decline_reason', '')
        if request.data.get('remarks'):
            loan.remarks = request.data.get('remarks')
        loan.save()
    return Response(LoanSerializer(loan).data)