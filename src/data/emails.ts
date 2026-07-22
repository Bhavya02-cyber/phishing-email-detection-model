export type EmailSample = {
  text: string;
  label: 0 | 1; // 0 = Safe, 1 = Phishing
};

export const emailDataset: EmailSample[] = [
  // Safe emails
  {
    text: "Hi team, please review the attached quarterly report and let me know your thoughts by Friday.",
    label: 0,
  },
  {
    text: "Thank you for your order! Your package will arrive on Tuesday. Track it at our official store.",
    label: 0,
  },
  {
    text: "Can we reschedule our meeting to 2 PM? I have a conflict at the original time.",
    label: 0,
  },
  {
    text: "Your monthly newsletter is here. This week we cover productivity tips and new feature updates.",
    label: 0,
  },
  {
    text: "The project proposal looks great. I'll send the final version after legal review.",
    label: 0,
  },
  {
    text: "Happy birthday! Hope you have a wonderful day filled with joy and laughter.",
    label: 0,
  },
  {
    text: "Your invoice has been paid. Thank you for your business.",
    label: 0,
  },
  {
    text: "Reminder: dentist appointment tomorrow at 10 AM.",
    label: 0,
  },
  {
    text: "Join us for the company picnic this Saturday at the central park.",
    label: 0,
  },
  {
    text: "The flight itinerary for your upcoming trip is attached.",
    label: 0,
  },
  {
    text: "Your subscription has been renewed successfully.",
    label: 0,
  },
  {
    text: "Please find the meeting minutes from yesterday's standup below.",
    label: 0,
  },
  {
    text: "The restaurant reservation for 4 people is confirmed at 7 PM.",
    label: 0,
  },
  {
    text: "Your bank statement for this month is now available in your account portal.",
    label: 0,
  },
  {
    text: "Thanks for applying. We will review your resume and get back to you soon.",
    label: 0,
  },

  // Phishing emails
  {
    text: "Urgent: Your account has been suspended. Click here immediately to verify your password and restore access.",
    label: 1,
  },
  {
    text: "Congratulations! You won a free iPhone. Claim your prize now at http://prize-winner.xyz/claim.",
    label: 1,
  },
  {
    text: "Dear customer, unusual login activity detected. Verify your account details at http://secure-bank-login.tk.",
    label: 1,
  },
  {
    text: "Your PayPal account will be limited unless you confirm your billing information today.",
    label: 1,
  },
  {
    text: "Free gift card waiting! Click the link below and enter your credit card number to receive $500.",
    label: 1,
  },
  {
    text: "IRS notice: you owe back taxes. Pay immediately via Bitcoin to avoid arrest.",
    label: 1,
  },
  {
    text: "Security alert: someone tried to log in to your account from Russia. Update your password now.",
    label: 1,
  },
  {
    text: "You have an undelivered package. Please pay the shipping fee at http://shipping-fee.ml/pay.",
    label: 1,
  },
  {
    text: "Act now! Your Netflix subscription expires today. Update payment info at http://netflix-billing.ga.",
    label: 1,
  },
  {
    text: "Verify your email immediately or your account will be deleted permanently.",
    label: 1,
  },
  {
    text: "Lottery winner! Send us your bank details so we can transfer the jackpot.",
    label: 1,
  },
  {
    text: "Your Apple ID has been locked. Confirm your identity at http://apple-id-secure.cf.",
    label: 1,
  },
  {
    text: "Reset your password now by downloading the attached file and entering your credentials.",
    label: 1,
  },
  {
    text: "Exclusive deal: 90% off luxury watches. Buy now with your credit card at http://cheap-watches.cc.",
    label: 1,
  },
  {
    text: "We noticed suspicious activity. Please verify your social security number to keep your account safe.",
    label: 1,
  },
];
