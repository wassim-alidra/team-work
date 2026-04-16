import os
import django
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agri_gov_market.settings")
django.setup()

from django.contrib.auth import get_user_model

ALGERIA_WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia", "Biskra", "Bechar",
    "Blida", "Bouira", "Tamanrasset", "Tebessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
    "Djelfa", "Jijel", "Setif", "Saida", "Skikda", "Sidi Bel Abbes", "Annaba", "Guelma",
    "Constantine", "Medea", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arreridj", "Boumerdes", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama", "Ain Temouchent", "Ghardaia", "Relizane",
    "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Baji Mokhtar", "Beni Abbes", "Timimoun", "Touggourt", "Djanet",
    "In Salah", "In Guezzam"
]

User = get_user_model()
users = User.objects.all()

updated_count = 0
for user in users:
    if not user.wilaya:
        random_wilaya = random.choice(ALGERIA_WILAYAS)
        user.wilaya = random_wilaya
        user.save()
        updated_count += 1
        print(f"Updated user {user.username} with wilaya {random_wilaya}")

print(f"Successfully updated {updated_count} users with a random wilaya.")
