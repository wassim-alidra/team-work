import requests
import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

class WeatherDashboardView(APIView):
    permission_classes = [permissions.AllowAny] # You can change this to IsAuthenticated if needed

    def get(self, request):
        API_KEY = "016703301c3347d84b85d9eaa230463d"
        # Get coordinates from query parameters (Defaults to Algiers)
        LAT = request.query_params.get('lat', 36.7525)
        LON = request.query_params.get('lon', 3.0420)

        # Endpoints
        # lang=en for English data
        weather_url = f"https://api.agromonitoring.com/agro/1.0/weather?lat={LAT}&lon={LON}&appid={API_KEY}&units=metric&lang=en"
        forecast_url = f"https://api.agromonitoring.com/agro/1.0/weather/forecast?lat={LAT}&lon={LON}&appid={API_KEY}&units=metric&lang=en"

        try:
            # Fetch Current Weather
            weather_response = requests.get(weather_url)
            weather_data = weather_response.json()

            # Fetch Forecast
            forecast_response = requests.get(forecast_url)
            forecast_data = forecast_response.json()

            if weather_response.status_code == 200:
                # Process Forecast (AgroMonitoring returns forecast items every 3 hours)
                # We'll take one per day for the next 3 days
                processed_forecast = []
                days_seen = set()
                today = datetime.datetime.now().date()

                # Forecast data is usually a list of items
                # We need to handle the case where forecast_data might be a dict or list
                items = forecast_data if isinstance(forecast_data, list) else []

                for item in items:
                    dt = datetime.datetime.fromtimestamp(item['dt'])
                    date = dt.date()
                    
                    if date > today and date not in days_seen and len(processed_forecast) < 3:
                        days_seen.add(date)
                        
                        # English day names mapping
                        day_name = dt.strftime("%A")
                        
                        processed_forecast.append({
                            "day": day_name,
                            "temp": item['main']['temp'],
                            "desc": item['weather'][0]['description']
                        })

                # Smarter Irrigation Recommendation Logic
                temp = weather_data.get('main', {}).get('temp', 22)
                humidity = weather_data.get('main', {}).get('humidity', 50)
                desc = weather_data.get('weather', [{}])[0].get('description', '').lower()
                
                # Mock soil moisture for visual feedback (since real soil data requires Polygon ID)
                # We fluctuate it based on humidity for a bit of "realism" in the UI
                soil_moisture = (humidity / 100.0) * 0.7 + 0.15 
                
                is_needed = False
                if any(word in desc for word in ["rain", "drizzle", "thunderstorm", "shower"]):
                    irrigation_status = "No irrigation needed (Natural rainfall)"
                    is_needed = False
                elif temp > 32:
                    irrigation_status = "Irrigation recommended (High heat alert)"
                    is_needed = True
                elif temp > 28 and humidity < 40:
                    irrigation_status = "Irrigation recommended (High evaporation)"
                    is_needed = True
                elif humidity < 25:
                    irrigation_status = "Irrigation recommended (Dry air stress)"
                    is_needed = True
                elif soil_moisture < 0.4:
                    irrigation_status = "Irrigation recommended (Low soil moisture)"
                    is_needed = True
                else:
                    irrigation_status = "Optimal conditions, no irrigation needed"
                    is_needed = False

                final_response = {
                    "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "weather": {
                        "temp": weather_data.get('main', {}).get('temp', '--'),
                        "humidity": weather_data.get('main', {}).get('humidity', '--'),
                        "description": weather_data.get('weather', [{}])[0].get('description', 'Not available').capitalize()
                    },
                    "soil": {
                        "moisture": soil_moisture,
                        "surface_temp": weather_data.get('main', {}).get('temp', 24),
                        "irrigation_recommendation": irrigation_status,
                        "is_needed": is_needed
                    },
                    "forecast": processed_forecast if processed_forecast else [
                        {"day": "Tomorrow", "temp": "--", "desc": "Not available"},
                        {"day": "Day After", "temp": "--", "desc": "Not available"},
                        {"day": "Day 3", "temp": "--", "desc": "Not available"}
                    ]
                }
                return Response(final_response)
            else:
                return Response({"error": "Failed to fetch data from weather provider"}, status=400)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
