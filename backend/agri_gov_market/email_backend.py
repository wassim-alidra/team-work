import ssl
from django.core.mail.backends.smtp import EmailBackend as SmtpEmailBackend

class UnverifiedEmailBackend(SmtpEmailBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Force unverified context
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        self.ssl_context = context
