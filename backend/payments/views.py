from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentSerializer


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def payment_list_view(request):
    if request.method == 'GET':
        qs = Payment.objects.all()
        if request.user.role == 'member': qs = qs.filter(member__user=request.user)
        return Response(PaymentSerializer(qs, many=True).data)
    if request.user.role not in ['admin','staff']: return Response({'error':'Unauthorized.'}, status=403)
    s = CreatePaymentSerializer(data=request.data, context={'request':request})
    if s.is_valid(): p = s.save(); return Response(PaymentSerializer(p).data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_stats_view(request):
    return Response({
        'total_collected':   Payment.objects.aggregate(t=Sum('amount'))['t'] or 0,
        'transaction_count': Payment.objects.count(),
    })