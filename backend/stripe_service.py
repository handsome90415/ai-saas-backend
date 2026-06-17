import stripe
from config import STRIPE_SECRET_KEY

stripe.api_key = STRIPE_SECRET_KEY

PLANS = {
    "free": {"name": "免費版", "price": 0, "text_limit": 10, "image_limit": 5},
    "pro": {"name": "專業版", "price": 999, "text_limit": -1, "image_limit": 100},
    "enterprise": {"name": "企業版", "price": 2999, "text_limit": -1, "image_limit": -1},
}

PRO_PRICE_ID = "price_pro_monthly"
ENTERPRISE_PRICE_ID = "price_enterprise_monthly"


def create_checkout_session(customer_id: str, price_id: str, success_url: str, cancel_url: str):
    return stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
    )


def create_customer(email: str, name: str | None = None):
    return stripe.Customer.create(email=email, name=name)


def create_portal_session(customer_id: str, return_url: str):
    return stripe.billing_portal.Session.create(customer=customer_id, return_url=return_url)
