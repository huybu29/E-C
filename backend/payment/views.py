import hashlib, hmac, json, requests
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["POST"])
def momo_create_payment(request):
    """
    Tạo link thanh toán Momo
    """
    amount = request.data.get("amount")
    order_id = request.data.get("orderId")
    request_id = order_id

    raw_signature = f"accessKey={settings.MOMO_ACCESS_KEY}&amount={amount}&extraData=&ipnUrl={settings.MOMO_IPN_URL}&orderId={order_id}&orderInfo=Thanh toán đơn hàng&partnerCode={settings.MOMO_PARTNER_CODE}&redirectUrl={settings.MOMO_REDIRECT_URL}&requestId={request_id}&requestType=captureWallet"

    signature = hmac.new(
        bytes(settings.MOMO_SECRET_KEY, 'utf-8'),
        bytes(raw_signature, 'utf-8'),
        hashlib.sha256
    ).hexdigest()

    payload = {
        "partnerCode": settings.MOMO_PARTNER_CODE,
        "partnerName": "Ecommerce Test",
        "storeId": "Test Store",
        "requestId": request_id,
        "amount": str(amount),
        "orderId": order_id,
        "orderInfo": "Thanh toán đơn hàng",
        "redirectUrl": settings.MOMO_REDIRECT_URL,
        "ipnUrl": settings.MOMO_IPN_URL,
        "lang": "vi",
        "extraData": "",
        "requestType": "captureWallet",
        "signature": signature
    }

    res = requests.post(settings.MOMO_ENDPOINT, json=payload)
    return Response(res.json())

@csrf_exempt
@api_view(["POST"])
def momo_ipn(request):
    """
    Nhận thông báo thanh toán từ Momo
    """
    data = request.data
    if data.get("resultCode") == 0:
        # Thanh toán thành công
        return Response({"message": "Thanh toán thành công", "data": data})
    else:
        return Response({"message": "Thanh toán thất bại", "data": data})
