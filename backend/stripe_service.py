import stripe
from config import STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_BUSINESS_PRICE_ID

stripe.api_key = STRIPE_SECRET_KEY

PLANS = {
    "free": {"name": "免費版", "price": 0, "text_limit": 5, "image_limit": 3},
    "pro": {"name": "專業版", "price": 999, "text_limit": 200, "image_limit": 20},
    "business": {"name": "商業版", "price": 1999, "text_limit": 800, "image_limit": 60},
    "enterprise": {"name": "企業版", "price": 0, "text_limit": -1, "image_limit": -1},
}


def get_price_id(plan: str) -> str:
    if plan == "pro":
        return STRIPE_PRO_PRICE_ID
    if plan == "business":
        return STRIPE_BUSINESS_PRICE_ID
    raise ValueError(f"Unknown plan: {plan}")


def create_checkout_session(customer_id: str, price_id: str, success_url: str, cancel_url: str, metadata: dict | None = None):
    return stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata or {},
    )


def create_customer(email: str, name: str | None = None):
    return stripe.Customer.create(email=email, name=name)


def create_portal_session(customer_id: str, return_url: str):
    return stripe.billing_portal.Session.create(customer=customer_id, return_url=return_url)
