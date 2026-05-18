import requests
import datetime
from market.models import Notification
from farms.models import Farm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

class WeatherDashboardView(APIView):
    permission_classes = [permissions.AllowAny]

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

                # --- Extract ALL real fields from the API response ---
                temp        = weather_data.get('main', {}).get('temp', 22)
                feels_like  = weather_data.get('main', {}).get('feels_like', temp)
                temp_min    = weather_data.get('main', {}).get('temp_min', temp)
                temp_max    = weather_data.get('main', {}).get('temp_max', temp)
                humidity    = weather_data.get('main', {}).get('humidity', 50)
                pressure    = weather_data.get('main', {}).get('pressure', 1013)
                visibility  = weather_data.get('visibility', 10000)  # in meters
                wind_speed  = weather_data.get('wind', {}).get('speed', 0)  # m/s
                wind_deg    = weather_data.get('wind', {}).get('deg', 0)
                wind_gust   = weather_data.get('wind', {}).get('gust', 0)
                clouds_pct  = weather_data.get('clouds', {}).get('all', 0)  # 0-100%
                rain_1h     = weather_data.get('rain', {}).get('1h', 0)     # mm last 1h
                snow_1h     = weather_data.get('snow', {}).get('1h', 0)     # mm last 1h
                sunrise_ts  = weather_data.get('sys', {}).get('sunrise', 0)
                sunset_ts   = weather_data.get('sys', {}).get('sunset', 0)
                city_name   = weather_data.get('name', 'Unknown')
                country     = weather_data.get('sys', {}).get('country', '')
                desc        = weather_data.get('weather', [{}])[0].get('description', '').lower()
                weather_icon = weather_data.get('weather', [{}])[0].get('icon', '01d')

                # Convert sunrise/sunset Unix timestamps to readable time strings
                sunrise_str = datetime.datetime.fromtimestamp(sunrise_ts).strftime("%H:%M") if sunrise_ts else '--'
                sunset_str  = datetime.datetime.fromtimestamp(sunset_ts).strftime("%H:%M") if sunset_ts else '--'

                # --- Agronomic Multi-Factor Irrigation Scoring ---
                # Step 1: Automatic override — if it IS raining right now, skip scoring
                is_raining_now = rain_1h > 0 or any(
                    word in desc for word in ["rain", "drizzle", "thunderstorm", "shower", "sleet"]
                )

                if is_raining_now:
                    irrigation_status = f"No irrigation needed — active rainfall ({rain_1h:.1f} mm/h)"
                    is_needed = False
                    urgency_score = 0
                else:
                    # Step 2: Compute an Evapotranspiration (ET) stress score from real API fields
                    urgency_score = 0.0

                    # --- Temperature contribution ---
                    if temp >= 38:
                        urgency_score += 4.0   # Extreme heat, critical water loss
                    elif temp >= 34:
                        urgency_score += 3.0   # Severe heat stress
                    elif temp >= 30:
                        urgency_score += 2.0   # High evapotranspiration rate
                    elif temp >= 26:
                        urgency_score += 1.0   # Moderate warmth, some water loss

                    # --- Humidity contribution ---
                    if humidity < 20:
                        urgency_score += 3.0   # Extreme dry air — plants lose water fast
                    elif humidity < 35:
                        urgency_score += 2.0   # Low humidity, high vapour pressure deficit
                    elif humidity < 50:
                        urgency_score += 1.0   # Moderately dry air
                    elif humidity > 80:
                        urgency_score -= 0.5   # High humidity reduces evaporation demand

                    # --- Wind contribution (increases surface evaporation) ---
                    if wind_speed >= 10:
                        urgency_score += 2.0   # Strong wind dries soil rapidly
                    elif wind_speed >= 6:
                        urgency_score += 1.0   # Moderate wind, noticeable effect
                    elif wind_speed >= 3:
                        urgency_score += 0.5   # Light wind, minor effect

                    # --- Cloud cover contribution (less sun = less evaporation) ---
                    if clouds_pct >= 75:
                        urgency_score -= 1.0   # Overcast sky reduces solar radiation significantly
                    elif clouds_pct >= 40:
                        urgency_score -= 0.5   # Partly cloudy, slight relief

                    # --- Determine recommendation from final score ---
                    if urgency_score >= 6:
                        irrigation_status = (
                            f"🚨 Urgent irrigation required — extreme conditions "
                            f"(temp {temp}°C, humidity {humidity}%, wind {wind_speed} m/s)"
                        )
                        is_needed = True
                    elif urgency_score >= 4:
                        irrigation_status = (
                            f"💧 Irrigation strongly recommended — high evapotranspiration stress "
                            f"(temp {temp}°C, humidity {humidity}%)"
                        )
                        is_needed = True
                    elif urgency_score >= 2:
                        irrigation_status = (
                            f"💧 Irrigation advisable — moderate water demand "
                            f"(temp {temp}°C, humidity {humidity}%)"
                        )
                        is_needed = True
                    elif urgency_score >= 1:
                        irrigation_status = (
                            f"⚠️ Light irrigation may be beneficial "
                            f"(temp {temp}°C, humidity {humidity}%)"
                        )
                        is_needed = False   # Advisory only, not critical
                    else:
                        irrigation_status = (
                            f"✅ No irrigation needed — conditions are optimal "
                            f"(temp {temp}°C, humidity {humidity}%, clouds {clouds_pct}%)"
                        )
                        is_needed = False

                final_response = {
                    "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "location": {
                        "city": city_name,
                        "country": country,
                        "lat": LAT,
                        "lon": LON,
                    },
                    "weather": {
                        "temp": temp,
                        "feels_like": feels_like,
                        "temp_min": temp_min,
                        "temp_max": temp_max,
                        "humidity": humidity,
                        "pressure": pressure,
                        "description": desc.capitalize(),
                        "icon": f"https://openweathermap.org/img/wn/{weather_icon}@2x.png",
                        "visibility_km": round(visibility / 1000, 1),
                    },
                    "wind": {
                        "speed_ms": wind_speed,
                        "speed_kmh": round(wind_speed * 3.6, 1),
                        "deg": wind_deg,
                        "gust_ms": wind_gust,
                    },
                    "clouds": {
                        "coverage_pct": clouds_pct,
                    },
                    "precipitation": {
                        "rain_1h_mm": rain_1h,
                        "snow_1h_mm": snow_1h,
                    },
                    "sun": {
                        "sunrise": sunrise_str,
                        "sunset": sunset_str,
                    },
                    "irrigation": {
                        "recommendation": irrigation_status,
                        "is_needed": is_needed,
                        "urgency_score": round(urgency_score, 1),  # 0-9+ scale for frontend gauge/bar
                        "surface_temp": temp,
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
class DeviceControlView(WeatherDashboardView):
    def get(self, request):
        response = super().get(request)

        if response.status_code != 200:
            return response

        data = response.data

        is_needed = data.get("irrigation", {}).get("is_needed", False)

        recommendation = data.get(
            "irrigation",
            {}
        ).get(
            "recommendation",
            "No recommendation"
        )

        farm_id = request.query_params.get("farm_id")
        check_only = request.query_params.get("check_only", "false").lower() == "true"

        if is_needed and farm_id and not check_only:
            try:
                farm = Farm.objects.get(id=farm_id)

                Notification.objects.create(
                    recipient=farm.farmer,
                    message=f"Automatic irrigation started for {farm.name}. {recommendation}"
                )

            except Farm.DoesNotExist:
                pass

        return Response({
            "pump_on": is_needed,
            "relay": 1 if is_needed else 0,
            "message": recommendation
        })