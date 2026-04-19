from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import requests

# Algerian wilayas with (latitude, longitude) — matches common wilaya names used in user profiles
WILAYA_COORDS = {
    "Adrar": (27.8742, -0.2914),
    "Chlef": (36.1648, 1.3317),
    "Laghouat": (33.8000, 2.8650),
    "Oum El Bouaghi": (35.8778, 7.1122),
    "Batna": (35.5550, 6.1742),
    "Béjaïa": (36.7525, 5.0560),
    "Biskra": (34.8500, 5.7333),
    "Béchar": (31.6238, -2.2162),
    "Blida": (36.4700, 2.8300),
    "Bouira": (36.3700, 3.9000),
    "Tamanrasset": (22.7850, 5.5228),
    "Tébessa": (35.4040, 8.1200),
    "Tlemcen": (34.8800, -1.3200),
    "Tiaret": (35.3700, 1.3200),
    "Tizi Ouzou": (36.7167, 4.0500),
    "Alger": (36.7372, 3.0865),
    "Algiers": (36.7372, 3.0865),
    "Djelfa": (34.6700, 3.2600),
    "Jijel": (36.8200, 5.7700),
    "Sétif": (36.1911, 5.4131),
    "Saïda": (34.8300, 0.1500),
    "Skikda": (36.8760, 6.9060),
    "Sidi Bel Abbès": (35.1900, -0.6400),
    "Annaba": (36.9000, 7.7667),
    "Guelma": (36.4620, 7.4260),
    "Constantine": (36.3650, 6.6147),
    "Médéa": (36.2639, 2.7539),
    "Mostaganem": (35.9311, 0.0892),
    "M'Sila": (35.7050, 4.5400),
    "Mascara": (35.3956, 0.1400),
    "Ouargla": (31.9500, 5.3250),
    "Oran": (35.6969, -0.6331),
    "El Bayadh": (33.6800, 1.0200),
    "Illizi": (26.5000, 8.4833),
    "Bordj Bou Arréridj": (36.0700, 4.7600),
    "Boumerdès": (36.7622, 3.4778),
    "El Tarf": (36.7670, 8.3130),
    "Tindouf": (27.6742, -8.1472),
    "Tissemsilt": (35.6078, 1.8119),
    "El Oued": (33.3667, 6.8500),
    "Khenchela": (35.4236, 7.1436),
    "Souk Ahras": (36.2844, 7.9517),
    "Tipaza": (36.5897, 2.4478),
    "Mila": (36.4503, 6.2636),
    "Aïn Defla": (36.2542, 1.9658),
    "Naâma": (33.2667, -0.3167),
    "Aïn Témouchent": (35.2978, -1.1400),
    "Ghardaïa": (32.4908, 3.6736),
    "Relizane": (35.7378, 0.5556),
}

def get_coords_by_name(name):
    """Case-insensitive wilaya coordinate lookup."""
    if not name:
        return None
    normalized = name.strip()
    # Direct match
    if normalized in WILAYA_COORDS:
        return WILAYA_COORDS[normalized]
    # Case-insensitive match
    for key, val in WILAYA_COORDS.items():
        if key.lower() == normalized.lower():
            return val
    # Partial match
    for key, val in WILAYA_COORDS.items():
        if normalized.lower() in key.lower() or key.lower() in normalized.lower():
            return val
    return None


class WilayaListView(APIView):
    """Returns list of all known wilayas with their coordinates."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = [
            {"name": name, "latitude": coords[0], "longitude": coords[1]}
            for name, coords in WILAYA_COORDS.items()
        ]
        return Response(data, status=status.HTTP_200_OK)


class CalculateRouteView(APIView):
    """
    Calculates road route between farmer wilaya and buyer wilaya
    using the OpenRouteService API.
    Query params: farmer_wilaya, buyer_wilaya (wilaya name strings)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        farmer_wilaya = request.GET.get('farmer_wilaya')
        buyer_wilaya = request.GET.get('buyer_wilaya')

        if not farmer_wilaya or not buyer_wilaya:
            return Response(
                {'error': 'farmer_wilaya and buyer_wilaya are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        farmer_coords = get_coords_by_name(farmer_wilaya)
        buyer_coords = get_coords_by_name(buyer_wilaya)

        if not farmer_coords:
            return Response(
                {'error': f'Could not find coordinates for farmer wilaya: {farmer_wilaya}'},
                status=status.HTTP_404_NOT_FOUND
            )
        if not buyer_coords:
            return Response(
                {'error': f'Could not find coordinates for buyer wilaya: {buyer_wilaya}'},
                status=status.HTTP_404_NOT_FOUND
            )

        f_lat, f_lng = farmer_coords
        b_lat, b_lng = buyer_coords

        headers = {
            'Authorization': settings.OPENROUTESERVICE_API_KEY,
            'Content-Type': 'application/json'
        }
        body = {
            "coordinates": [[f_lng, f_lat], [b_lng, b_lat]],
            "format": "geojson",
            "radiuses": [10000, 10000]
        }

        try:
            ors_response = requests.post(
                'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
                json=body,
                headers=headers,
                timeout=15
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Network error contacting routing service: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        if ors_response.status_code != 200:
            return Response(
                {'error': 'Failed to calculate route from OpenRouteService',
                 'details': ors_response.text},
                status=ors_response.status_code
            )

        data = ors_response.json()
        try:
            feature = data['features'][0]
            properties = feature['properties']
            geometry = feature['geometry']

            distance_km = round(properties['summary'].get('distance', 0) / 1000.0, 2)
            duration_mins = round(properties['summary'].get('duration', 0) / 60.0, 1)

            return Response({
                'distance_km': distance_km,
                'duration_mins': duration_mins,
                'geometry': geometry['coordinates'],  # [Lng, Lat] — frontend reverses for Leaflet
                'farmer_coords': {'lat': f_lat, 'lng': f_lng},
                'buyer_coords': {'lat': b_lat, 'lng': b_lng},
                'farmer_wilaya': farmer_wilaya,
                'buyer_wilaya': buyer_wilaya,
            }, status=status.HTTP_200_OK)

        except (KeyError, IndexError):
            return Response(
                {'error': 'Unexpected response format from routing service'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
