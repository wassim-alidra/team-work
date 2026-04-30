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

class ChatbotAskView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            # Ensure API Key is loaded
            api_key = os.getenv("GEMINI_API_KEY")
            print(f"DEBUG: GEMINI_API_KEY found: {bool(api_key)}")
            
            if not api_key:
                return Response({"error": "GEMINI_API_KEY not found in environment variables. Check your .env file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            genai.configure(api_key=api_key)
            
            # Accept 'question' (from new frontend) or 'text' (from old frontend)
            text_query = request.data.get('question') or request.data.get('text', '')
            image_file = request.FILES.get('image', None)
            
            print(f"DEBUG: text_query: {text_query[:50] if text_query else 'None'}...")
            print(f"DEBUG: image_file: {image_file.name if image_file else 'None'}")

            if not text_query and not image_file:
                return Response({"error": "No text or image provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Initialize model
            model = genai.GenerativeModel('gemini-flash-latest')

            prompt_parts = []
            
            system_instruction = (
               "You are an AI Agricultural Assistant for Algerian farmers. "
               "You must respond ONLY in English. "
               "Be helpful, professional, and provide accurate agricultural advice for Algeria. "
               "Algeria has Mediterranean climate with mild winters and hot summers. "
            )

            if image_file:
                img = Image.open(image_file)
                disease_prompt = (
                   "Analyze this plant image for diseases. Return the response ONLY in English with the following structure:\n"
                   "1. Disease Name\n"
                   "2. Confidence Level (0-100%)\n"
                   "3. Symptoms\n"
                   "4. Treatment\n"
                   "5. Prevention\n"
                   "If the image is not a plant or no disease is detected, state that clearly in English."
                )
                prompt_parts = [system_instruction, disease_prompt, text_query, img]
            else:
                prompt_parts = [system_instruction, text_query]

            response = model.generate_content(prompt_parts)
            
            try:
                ai_text = response.text
            except ValueError:
                ai_text = "Sorry, I was unable to process this request. Please make sure the question or image is related to the agricultural field."

            return Response({
                "response": ai_text
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"ERROR in ChatbotAskView: {str(e)}")
            traceback.print_exc()
            return Response({
                "error": str(e),
                "traceback": traceback.format_exc() if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

