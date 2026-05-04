import os
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from PIL import Image
import requests

class ChatbotAskView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        # If no API key is configured, return error
        if not gemini_api_key:
            return Response({
                "response": "Gemini API key not configured. Please add GEMINI_API_KEY to backend/.env file."
            }, status=200)

        text_query = request.data.get('question') or request.data.get('text', '')
        image_file = request.FILES.get('image', None)

        if not text_query and not image_file:
            return Response({
                "response": "Please provide a question or an image."
            }, status=200)

        # Fetch official price from database if the question is about a product
        price_info = None
        if text_query:
            try:
                from market.models import ProductCatalog
                all_products = ProductCatalog.objects.values_list('name', flat=True)
                query_lower = text_query.lower()
                
                for product_name in all_products:
                    if product_name.lower() in query_lower:
                        product_obj = ProductCatalog.objects.filter(name=product_name).first()
                        if product_obj and product_obj.min_price and product_obj.max_price:
                            price_info = f"The official price for {product_obj.name} is between {product_obj.min_price} and {product_obj.max_price} DA per {product_obj.unit}."
                        break
            except Exception as e:
                print(f"Error fetching product price: {e}")

        # Build the prompt for Gemini
        prompt = """You are an AI Agricultural Assistant for Algerian farmers.
        
CRITICAL RULES:
1. LANGUAGE: Answer in the SAME LANGUAGE as the user's question (English/Arabic/French).
2. BREVITY: Keep answers SHORT - maximum 2 sentences.
3. If the user asks about a product price, use the OFFICIAL PRICE INFO below if available.
4. Be direct, practical, and helpful.

"""

        if price_info:
            prompt += f"\nOFFICIAL PRICE INFO: {price_info}\n\n"

        prompt += f"User question: {text_query}\n\nAnswer:"

        # Call Gemini API
        try:
            genai.configure(api_key=gemini_api_key)
            
            # Try different model names (Gemini will use the latest available)
            model_names = ['gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-pro']
            response_text = None
            
            for model_name in model_names:
                try:
                    model = genai.GenerativeModel(model_name)
                    
                    if image_file:
                        image_file.seek(0)
                        img = Image.open(image_file)
                        response = model.generate_content([prompt, img])
                    else:
                        response = model.generate_content(prompt)
                    
                    response_text = response.text
                    break  # Success, exit loop
                except Exception as e:
                    print(f"Model {model_name} failed: {e}")
                    continue
            
            if response_text:
                return Response({"response": response_text}, status=200)
            else:
                return Response({
                    "response": "Sorry, no AI model is available at this time. Please try again later."
                }, status=200)
            
        except Exception as e:
            print(f"Gemini Error: {e}")
            return Response({
                "response": f"Sorry, an error occurred: {str(e)}"
            }, status=200)