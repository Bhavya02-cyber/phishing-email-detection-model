"""
Phishing Email Detection Model (Scikit-learn reference implementation)
======================================================================
This script mirrors the client-side classifier in the web app using the
real scikit-learn pipeline:
    CountVectorizer + engineered features + LogisticRegression
It trains on the same dataset, prints accuracy, confusion matrix, and top
features, and can be run in any Python environment with scikit-learn installed.

Usage:
    pip install scikit-learn pandas
    python public/phishing_model.py
"""

import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
)

# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------
emails = [
    # Safe
    ("Hi team, please review the attached quarterly report and let me know your thoughts by Friday.", 0),
    ("Thank you for your order! Your package will arrive on Tuesday. Track it at our official store.", 0),
    ("Can we reschedule our meeting to 2 PM? I have a conflict at the original time.", 0),
    ("Your monthly newsletter is here. This week we cover productivity tips and new feature updates.", 0),
    ("The project proposal looks great. I'll send the final version after legal review.", 0),
    ("Happy birthday! Hope you have a wonderful day filled with joy and laughter.", 0),
    ("Your invoice has been paid. Thank you for your business.", 0),
    ("Reminder: dentist appointment tomorrow at 10 AM.", 0),
    ("Join us for the company picnic this Saturday at the central park.", 0),
    ("The flight itinerary for your upcoming trip is attached.", 0),
    ("Your subscription has been renewed successfully.", 0),
    ("Please find the meeting minutes from yesterday's standup below.", 0),
    ("The restaurant reservation for 4 people is confirmed at 7 PM.", 0),
    ("Your bank statement for this month is now available in your account portal.", 0),
    ("Thanks for applying. We will review your resume and get back to you soon.", 0),

    # Phishing
    ("Urgent: Your account has been suspended. Click here immediately to verify your password and restore access.", 1),
    ("Congratulations! You won a free iPhone. Claim your prize now at http://prize-winner.xyz/claim.", 1),
    ("Dear customer, unusual login activity detected. Verify your account details at http://secure-bank-login.tk.", 1),
    ("Your PayPal account will be limited unless you confirm your billing information today.", 1),
    ("Free gift card waiting! Click the link below and enter your credit card number to receive $500.", 1),
    ("IRS notice: you owe back taxes. Pay immediately via Bitcoin to avoid arrest.", 1),
    ("Security alert: someone tried to log in to your account from Russia. Update your password now.", 1),
    ("You have an undelivered package. Please pay the shipping fee at http://shipping-fee.ml/pay.", 1),
    ("Act now! Your Netflix subscription expires today. Update payment info at http://netflix-billing.ga.", 1),
    ("Verify your email immediately or your account will be deleted permanently.", 1),
    ("Lottery winner! Send us your bank details so we can transfer the jackpot.", 1),
    ("Your Apple ID has been locked. Confirm your identity at http://apple-id-secure.cf.", 1),
    ("Reset your password now by downloading the attached file and entering your credentials.", 1),
    ("Exclusive deal: 90% off luxury watches. Buy now with your credit card at http://cheap-watches.cc.", 1),
    ("We noticed suspicious activity. Please verify your social security number to keep your account safe.", 1),
]

df = pd.DataFrame(emails, columns=["text", "label"])

# ---------------------------------------------------------------------------
# Feature engineering
# ---------------------------------------------------------------------------
SUSPICIOUS_KEYWORDS = [
    "urgent", "suspended", "verify", "password", "click here",
    "congratulations", "won", "free", "claim", "prize", "limited",
    "account", "billing", "credit card", "social security", "bitcoin",
    "arrest", "irs", "undelivered", "shipping fee", "expires today",
    "locked", "download", "credentials", "suspicious activity",
]
SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".xyz", ".top", ".cc", ".work", ".click", ".link", ".biz"]
URL_RE = re.compile(r"https?://[^\s\"'<>()]+", re.IGNORECASE)


def extract_url_features(texts):
    features = []
    for text in texts:
        lower = text.lower()
        urls = URL_RE.findall(lower)
        url_count = len(urls)
        suspicious_tld_count = sum(
            1 for url in urls if any(url.endswith(tld) or tld in url for tld in SUSPICIOUS_TLDS)
        )
        total_url_length = sum(len(url) for url in urls)
        keyword_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in lower)
        features.append([url_count, suspicious_tld_count, total_url_length, keyword_count])
    return np.array(features)


# ---------------------------------------------------------------------------
# Build feature matrix
# ---------------------------------------------------------------------------
count_vec = CountVectorizer(stop_words="english", max_features=200)
X_text = count_vec.fit_transform(df["text"]).toarray()
X_engineered = extract_url_features(df["text"])
X = np.hstack([X_text, X_engineered])
y = df["label"].values

# ---------------------------------------------------------------------------
# Train classifier
# ---------------------------------------------------------------------------
clf = LogisticRegression(max_iter=1000, C=100, solver="lbfgs")
clf.fit(X, y)

# ---------------------------------------------------------------------------
# Evaluate
# ---------------------------------------------------------------------------
preds = clf.predict(X)
acc = accuracy_score(y, preds)
cm = confusion_matrix(y, preds)

print(f"Accuracy: {acc:.3f}")
print(f"Precision: {precision_score(y, preds):.3f}")
print(f"Recall: {recall_score(y, preds):.3f}")
print(f"F1 Score: {f1_score(y, preds):.3f}")
print("\nConfusion Matrix:")
print(cm)
print("\nClassification Report:")
print(classification_report(y, preds, target_names=["Safe", "Phishing"]))

# ---------------------------------------------------------------------------
# Top features
# ---------------------------------------------------------------------------
feature_names = list(count_vec.get_feature_names_out()) + [
    "url_count", "suspicious_tld_count", "total_url_length", "keyword_count"
]
coefs = clf.coef_[0]
top_idx = np.argsort(np.abs(coefs))[::-1][:12]
print("\nTop influential features:")
for idx in top_idx:
    print(f"  {feature_names[idx]:20s} {coefs[idx]:+.4f}")
