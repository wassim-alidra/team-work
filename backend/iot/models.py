from django.db import models
from farms.models import Farm

class FireAlert(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='fire_alerts')
    timestamp = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Fire Alert at {self.farm.name} - {self.timestamp}"
