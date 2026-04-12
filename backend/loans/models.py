from django.db import models
from django.utils import timezone
from members.models import Member


class MembershipApplication(models.Model):
    STATUS = [('Pending','Pending'),('Approved','Approved'),('Rejected','Rejected')]

    app_id       = models.CharField(max_length=20, unique=True, blank=True)
    firstname    = models.CharField(max_length=50)
    lastname     = models.CharField(max_length=50)
    middlename   = models.CharField(max_length=50, blank=True)
    birthdate    = models.DateField()
    gender       = models.CharField(max_length=10)
    civil_status = models.CharField(max_length=15)
    contact      = models.CharField(max_length=15)
    email        = models.EmailField(blank=True)
    address      = models.TextField()
    occupation   = models.CharField(max_length=100)
    valid_id     = models.CharField(max_length=50)
    id_number    = models.CharField(max_length=50)
    beneficiary  = models.CharField(max_length=100, blank=True)
    relationship = models.CharField(max_length=50,  blank=True)
    status       = models.CharField(max_length=10, choices=STATUS, default='Pending')
    submitted_by = models.CharField(max_length=50, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at  = models.DateTimeField(null=True, blank=True)
    reviewed_by  = models.CharField(max_length=50, blank=True)
    reject_reason= models.TextField(blank=True)

    class Meta:
        db_table = 'membership_applications'
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.app_id} — {self.lastname}, {self.firstname} ({self.status})'

    def save(self, *args, **kwargs):
        if not self.app_id:
            count = MembershipApplication.objects.count() + 1
            self.app_id = f'OA-{timezone.now().year}-{str(count).zfill(3)}'
        super().save(*args, **kwargs)


class Loan(models.Model):
    TYPES  = [('Regular Loan','Regular Loan'),('Emergency Loan','Emergency Loan'),('Salary Loan','Salary Loan'),('Housing Loan','Housing Loan'),('Business Loan','Business Loan'),('Other Loan','Other Loan')]
    STATUS = [('For Review','For Review'),('Approved','Approved'),('Active','Active'),('Completed','Completed'),('Declined','Declined'),('Overdue','Overdue')]

    loan_id       = models.CharField(max_length=20, unique=True, blank=True)
    member        = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='loans')
    loan_type     = models.CharField(max_length=20, choices=TYPES)
    amount        = models.DecimalField(max_digits=12, decimal_places=2)
    term_months   = models.IntegerField()
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    monthly_due   = models.DecimalField(max_digits=12, decimal_places=2)
    balance       = models.DecimalField(max_digits=12, decimal_places=2)
    purpose       = models.TextField()
    collateral    = models.CharField(max_length=200, blank=True)
    status        = models.CharField(max_length=15, choices=STATUS, default='For Review')
    applied_at    = models.DateTimeField(auto_now_add=True)
    approved_at   = models.DateTimeField(null=True, blank=True)
    approved_by   = models.CharField(max_length=50, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    decline_reason= models.TextField(blank=True)

    class Meta:
        db_table = 'loans'
        ordering = ['-applied_at']

    def __str__(self):
        return f'{self.loan_id} — {self.member.fullname} ({self.status})'

    def save(self, *args, **kwargs):
        if not self.loan_id:
            count = Loan.objects.count() + 1
            self.loan_id = f'LN-{timezone.now().year}-{str(count).zfill(3)}'
        super().save(*args, **kwargs)