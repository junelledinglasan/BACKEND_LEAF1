from rest_framework import serializers
from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    fullname     = serializers.ReadOnlyField()
    max_loanable = serializers.ReadOnlyField()

    class Meta:
        model  = Member
        fields = '__all__'


class MemberListSerializer(serializers.ModelSerializer):
    fullname = serializers.ReadOnlyField()

    class Meta:
        model  = Member
        fields = ['id','member_id','firstname','lastname','fullname','contact','email','status','is_official','share_capital','date_registered']