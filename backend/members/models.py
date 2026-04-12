from django.db import models
from auth_app.models import User


class Member(models.Model):
    STATUS   = [('Active','Active'),('Inactive','Inactive'),('Suspended','Suspended'),('Pending','Pending')]
    GENDER   = [('Male','Male'),('Female','Female'),('Other','Other')]
    CIVIL    = [('Single','Single'),('Married','Married'),('Widowed','Widowed'),('Separated','Separated')]

    user          = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member_profile')
    member_id     = models.CharField(max_length=20, unique=True)
    firstname     = models.CharField(max_length=50)
    lastname      = models.CharField(max_length=50)
    middlename    = models.CharField(max_length=50, blank=True)
    birthdate     = models.DateField()
    gender        = models.CharField(max_length=10, choices=GENDER)
    civil_status  = models.CharField(max_length=15, choices=CIVIL)
    contact       = models.CharField(max_length=15)
    email         = models.EmailField(blank=True)
    address       = models.TextField()
    occupation    = models.CharField(max_length=100)
    valid_id      = models.CharField(max_length=50)
    id_number     = models.CharField(max_length=50)
    beneficiary   = models.CharField(max_length=100, blank=True)
    relationship  = models.CharField(max_length=50,  blank=True)
    share_capital = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status        = models.CharField(max_length=15, choices=STATUS, default='Pending')
    is_official   = models.BooleanField(default=False)
    date_registered = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'members'
        ordering = ['-date_registered']

    def __str__(self):
        return f'{self.member_id} — {self.lastname}, {self.firstname}'

    @property
    def fullname(self):
        return f'{self.firstname} {self.lastname}'

    @property
    def max_loanable(self):
        return self.share_capital * 3

    def save(self, *args, **kwargs):
        if not self.member_id:
            count = Member.objects.count() + 1
            self.member_id = f'LEAF-100-{str(count).zfill(2)}'
        super().save(*args, **kwargs)