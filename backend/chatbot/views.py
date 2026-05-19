import os
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from PIL import Image
import io
import traceback
import base64
from market.models import ProductCatalog

class ChatbotAskView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Use Gemini only
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        text_query = request.data.get('question') or request.data.get('text', '')
        image_file = request.FILES.get('image', None)

        if not text_query and not image_file:
            return Response({"error": "No text or image provided"}, status=status.HTTP_400_BAD_REQUEST)

        # ----------------------------------------------------
        # Real-time Official Product Database Lookup
        # ----------------------------------------------------
        query_lower = text_query.lower() if text_query else ""
        catalog_products = ProductCatalog.objects.filter(is_deleted=False)
        matched_catalog = None
        db_price_context = ""

        # Check if user mentioned any official catalog product name
        for prod in catalog_products:
            if prod.name.lower() in query_lower:
                matched_catalog = prod
                break

        if matched_catalog:
            min_p = matched_catalog.min_price or 0
            max_p = matched_catalog.max_price or 0
            unit = matched_catalog.unit or "kg"
            season = matched_catalog.get_season_display() if hasattr(matched_catalog, 'get_season_display') else matched_catalog.season
            db_price_context = (
                f"\nREAL-TIME DATABASE CONTEXT:\n"
                f"- Official Product: {matched_catalog.name}\n"
                f"- Category: {matched_catalog.category.name if matched_catalog.category else 'N/A'}\n"
                f"- Official Price Range: {min_p:.1f} DA to {max_p:.1f} DA per {unit}\n"
                f"- Recommended Season: {season}\n"
                f"- Current Database Status: Active & Official"
            )

        # Construct general list of official products if they ask generally about official prices
        is_asking_general_prices = any(x in query_lower for x in ["price", "prices", "official", "index", "سعر", "أسعار", "سعر المنتج", "tarif", "combien"])
        
        general_db_prices = ""
        if is_asking_general_prices and not matched_catalog:
            items = []
            for p in catalog_products[:6]:
                min_p = p.min_price or 0
                max_p = p.max_price or 0
                unit = p.unit or "kg"
                items.append(f"- {p.name}: {min_p:.1f} - {max_p:.1f} DA per {unit}")
            general_db_prices = "\nREAL-TIME DATABASE CONTEXT (General Price List):\n" + "\n".join(items)

        system_instruction = (
            "You are an AI Agricultural Assistant for Algerian farmers. "
            "CRITICAL RULES:\n"
            "1. LANGUAGE: You MUST answer in the SAME LANGUAGE as the user's question. "
            "   If the user asks in Arabic -> answer in Arabic. "
            "   If the user asks in English -> answer in English. "
            "   If the user asks in French -> answer in French.\n"
            "2. BREVITY: Keep answers SHORT and PRACTICAL. Maximum 2-3 sentences. "
            "   Farmers need quick advice, not long essays. Be direct and useful.\n"
            "3. FOCUS: Give only the most important information. "
            "   For planting dates: just say the months. No lengthy explanations.\n"
            "4. USE BULLET POINTS if listing multiple items, but keep each point short.\n"
            "5. DATABASE TRUTH: If real-time database context is provided below, you MUST use the exact numbers "
            "and prices from that context as the source of truth for official product prices."
            f"{db_price_context}"
            f"{general_db_prices}"
        )

        # --- GEMINI PATH ---
        if gemini_api_key:
            print("Entering Gemini Path...")
            try:
                genai.configure(api_key=gemini_api_key)
                
                # Using Gemini 3 Flash Preview as it is available and state-of-the-art
                model_name = 'gemini-3-flash-preview'
                model = genai.GenerativeModel(model_name)

                if image_file:
                    image_file.seek(0)
                    img = Image.open(image_file)
                    disease_prompt = (
                        "Analyze this plant image for diseases. CRITICAL RULES:\n"
                        "1. LANGUAGE: Answer in the SAME LANGUAGE as the user's question (or Arabic if no text).\n"
                        "2. BREVITY: Maximum 5 short bullet points total:\n"
                        "   • Disease name\n"
                        "   • Confidence (0-100%)\n"
                        "   • Symptoms (1 sentence)\n"
                        "   • Treatment (1 sentence)\n"
                        "   • Prevention (1 sentence)\n"
                        "3. NO long paragraphs. Be direct and helpful."
                    )
                    prompt_parts = [system_instruction, disease_prompt, text_query, img]
                else:
                    prompt_parts = [system_instruction, text_query]

                response = model.generate_content(prompt_parts)
                try:
                    ai_text = response.text
                except ValueError:
                    ai_text = "Sorry, I was unable to process this request. Please make sure the question or image is related to the agricultural field."

                return Response({"response": ai_text}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Gemini Error: {str(e)}")
                try:
                    model = genai.GenerativeModel('gemini-flash-latest')
                    response = model.generate_content(prompt_parts)
                    return Response({"response": response.text}, status=status.HTTP_200_OK)
                except Exception as e2:
                    print(f"Gemini Fallback Error: {str(e2)}")

        # --- SIMULATION FALLBACK (If no keys found or API failed) ---
        # If they asked specifically about prices, construct a beautiful direct database response
        if is_asking_general_prices:
            if matched_catalog:
                min_p = matched_catalog.min_price or 0
                max_p = matched_catalog.max_price or 0
                unit = matched_catalog.unit or "kg"
                if any(x in query_lower for x in ["سعر", "أسعار", "كم"]):
                    response_text = f"وفقًا لقاعدة البيانات، السعر الرسمي لـ {matched_catalog.name} هو بين {min_p:.1f} و {max_p:.1f} د.ج لكل {unit}."
                elif any(x in query_lower for x in ["prix", "tarif", "combien"]):
                    response_text = f"Selon notre base de données, le prix officiel de {matched_catalog.name} varie entre {min_p:.1f} et {max_p:.1f} DA par {unit}."
                else:
                    response_text = f"According to the database, the official price of {matched_catalog.name} is between {min_p:.1f} and {max_p:.1f} DA per {unit}."
                return Response({"response": response_text}, status=status.HTTP_200_OK)
            
            elif is_asking_general_prices:
                # General list fallback
                items_str = ", ".join([f"{p.name} ({p.min_price:.1f}-{p.max_price:.1f} DA)" for p in catalog_products[:4]])
                if any(x in query_lower for x in ["سعر", "أسعار"]):
                    response_text = f"إليك بعض الأسعار الرسمية من قاعدة البيانات: {items_str}."
                elif any(x in query_lower for x in ["prix", "tarif"]):
                    response_text = f"Voici les prix officiels de notre base de données : {items_str}."
                else:
                    response_text = f"Here are some official prices from the database: {items_str}."
                return Response({"response": response_text}, status=status.HTTP_200_OK)

        simulated_advice = {
            "potato": "In Algeria, plant potatoes from late September to October for the winter crop. Ensure soil is well-drained and use 15-15-15 fertilizer.",
            "tomato": "For tomato diseases like blight, ensure good air circulation and avoid overhead watering. Use copper-based fungicides if symptoms appear.",
            "wheat": "Wheat should be harvested when the grain is hard and the straw is yellow and brittle, usually from late May to July in Algeria.",
            "olive": "Pruning is best done after harvest in winter. Ensure the center of the tree is open to sunlight for better yield.",
            "irrigation": "For most crops, early morning is the best time for irrigation to reduce evaporation and prevent fungal diseases.",
            "disease": "Identify the symptoms (spots, wilting, or yellowing). Please upload a clear photo of the leaf for a more detailed analysis.",
        }

        response_text = None
        for key in simulated_advice:
            if key in query_lower:
                response_text = simulated_advice[key]
                break
        
        if not response_text:
            response_text = "I'm currently in 'Limited Mode'. The AI model is currently unavailable. Please ensure your GEMINI_API_KEY in the .env file is valid and has access to the 'gemini-3-flash-preview' model."

        return Response({"response": response_text}, status=status.HTTP_200_OK)

