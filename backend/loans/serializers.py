from rest_framework import serializers
from .models import MembershipApplication, Loan


class MembershipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MembershipApplication
        fields = '__all__'
        read_only_fields = ['app_id','submitted_at']


class LoanSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.fullname',  read_only=True)
    member_code = serializers.CharField(source='member.member_id', read_only=True)

    class Meta:
        model  = Loan
        fields = '__all__'
        read_only_fields = ['loan_id','applied_at']


class CreateLoanSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Loan
        fields = ['member','loan_type','amount','term_months','purpose','collateral']

    def create(self, validated_data):
        amt  = float(validated_data['amount'])
        term = validated_data['term_months']
        r    = 0.05 / 12
        monthly = amt * r / (1 - (1 + r) ** -term)
        validated_data['monthly_due']   = round(monthly, 2)
        validated_data['balance']       = amt
        validated_data['interest_rate'] = 5.00
        return super().create(validated_data)