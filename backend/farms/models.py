from django.db import models
from django.conf import settings

class Farm(models.Model):
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='farms', 
        limit_choices_to={'role': 'FARMER'}
    )
    name = models.CharField(max_length=255)
    wilaya = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='farms/', null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.wilaya})"
