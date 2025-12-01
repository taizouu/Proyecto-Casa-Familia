import uuid
from django.conf import settings
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_type import IntegrationType

USAR_MOCK_SIMULADO = True 

class MockWebpayService:
    def iniciar_transaccion(self, buy_order, session_id, amount, return_url):
        print(f"\n[MOCK] Iniciando transacción SIMULADA para orden: {buy_order}")
        
        token_falso = f"token_mock_{buy_order}_{uuid.uuid4()}"
        
        url_falsa = f"{return_url}?token_ws={token_falso}" 
        
        class RespuestaFake:
            def __init__(self, url, token):
                self.url = url
                self.token = token
                
        return RespuestaFake(url_falsa, token_falso)

    def confirmar_transaccion(self, token):
        print(f"\n[MOCK] Confirmando transacción SIMULADA token: {token}")
        
        try:
            parts = token.split('_')
            real_buy_order = parts[2]
        except IndexError:
            real_buy_order = "1" 

        class RespuestaFake:
            def __init__(self, buy_order_recuperada):
                self.vci = "TSY"
                self.amount = 1000
                self.status = "AUTHORIZED"
                self.buy_order = buy_order_recuperada 
                
            def is_approved(self):
                return True
        
        return RespuestaFake(real_buy_order)


class RealWebpayService:
    def __init__(self):
        print("--- INICIANDO SERVICIO WEBPAY REAL ---")
        self.commerce_code = "597055555535" 
        self.api_key = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1B"
        self.environment = IntegrationType.TEST
        
        options = WebpayOptions(
            commerce_code=self.commerce_code,
            api_key=self.api_key,
            integration_type=self.environment
        )
        self.transaction = Transaction(options)

    def iniciar_transaccion(self, buy_order, session_id, amount, return_url):
        return self.transaction.create(buy_order, session_id, amount, return_url)

    def confirmar_transaccion(self, token):
        return self.transaction.commit(token=token)


def WebpayService():
    if USAR_MOCK_SIMULADO:
        return MockWebpayService()
    else:
        return RealWebpayService()