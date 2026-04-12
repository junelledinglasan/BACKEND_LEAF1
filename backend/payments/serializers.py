from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.fullname',  read_only=True)
    member_code = serializers.CharField(source='member.member_id', read_only=True)
    loan_code   = serializers.CharField(source='loan.loan_id',     read_only=True)

    class Meta:
        model  = Payment
        fields = '__all__'
        read_only_fields = ['tx_id','hash','paid_at']


class CreatePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = ['loan','member','amount','note']

    def create(self, validated_data):
        loan   = validated_data['loan']
        amount = float(validated_data['amount'])
        loan.balance = max(float(loan.balance) - amount, 0)
        if loan.balance == 0: loan.status = 'Completed'
        loan.save()
        validated_data['balance']     = loan.balance
        validated_data['recorded_by'] = self.context['request'].user.username
        return super().create(validated_data)