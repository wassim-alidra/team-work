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

# Attempt to import groq
try:
    from groq import Groq
except ImportError:
    Groq = None

class ChatbotAskView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Prefer Groq if key is present, otherwise use Gemini
        groq_api_key = os.getenv("GROQ_API_KEY")
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        text_query = request.data.get('question') or request.data.get('text', '')
        image_file = request.FILES.get('image', None)

        if not text_query and not image_file:
            return Response({"error": "No text or image provided"}, status=status.HTTP_400_BAD_REQUEST)

        system_instruction = (
            "You are an AI Agricultural Assistant for Algerian farmers. "
            "You must respond ONLY in English. "
            "Be helpful, professional, and provide accurate agricultural advice for Algeria. "
            "Algeria has Mediterranean climate with mild winters and hot summers. "
        )

        # --- GROQ PATH ---
        if groq_api_key and Groq:
            try:
                client = Groq(api_key=groq_api_key)
                
                if image_file:
                    # Groq supports LLaVA-v1.5-7b for images
                    # Read and encode image to base64
                    image_content = image_file.read()
                    base64_image = base64.b64encode(image_content).decode('utf-8')
                    
                    messages = [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": f"{system_instruction}\nAnalyze this plant image for diseases. Structure: 1. Disease Name, 2. Confidence, 3. Symptoms, 4. Treatment, 5. Prevention. Respond ONLY in English. {text_query}"},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}",
                                    },
                                },
                            ],
                        }
                    ]
                    model_name = "llama-3.2-11b-vision-preview" # or llava-v1.5-7b-4096-preview
                else:
                    messages = [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": text_query}
                    ]
                    model_name = "llama-3-70b-versatile"

                chat_completion = client.chat.completions.create(
                    messages=messages,
                    model=model_name,
                )
                return Response({"response": chat_completion.choices[0].message.content}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Groq Error: {str(e)}")
                # If Groq fails, we fall back to Gemini if available

        # --- GEMINI PATH ---
        if gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                model = genai.GenerativeModel('gemini-flash-latest')

                if image_file:
                    # Reset image file pointer if it was read by Groq attempt
                    image_file.seek(0)
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

                return Response({"response": ai_text}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Gemini Error: {str(e)}")
                return Response({"error": f"API Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"error": "No valid AI API configuration found (check GEMINI_API_KEY or GROQ_API_KEY)"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

