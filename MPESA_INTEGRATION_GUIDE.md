# 🚀 M-Pesa Integration Guide

Complete M-Pesa STK Push integration for certificate payments.

## 📋 What Was Implemented

### Backend (Express + Prisma)
- ✅ **Payment Model** - Database schema for tracking payments
- ✅ **M-Pesa Service** - Clean service class for STK Push & status queries
- ✅ **Payment Routes** - REST API endpoints for payment flow
- ✅ **Automatic Callbacks** - M-Pesa webhook handler
- ✅ **Environment-based Config** - Easy sandbox ↔ production switch

### Frontend (Next.js + React)
- ✅ **Payment Modal** - Beautiful UI for M-Pesa payment
- ✅ **Payment Hooks** - React Query hooks for payment state
- ✅ **Certificate Paywall** - Requires payment before download
- ✅ **Real-time Status** - Auto-polling payment status
- ✅ **Success/Failure Handling** - User-friendly feedback

---

## 🎯 Current Configuration (SANDBOX)

Your app is currently in **SANDBOX MODE** for testing.

### Sandbox Credentials (Already Configured)
```env
MPESA_ENVIRONMENT=sandbox
MPESA_SANDBOX_CONSUMER_KEY="jTYdSFq0VCd5WzdJm0XSB2EYg2qg1uPri6281S5JYGbVyyYr"
MPESA_SANDBOX_CONSUMER_SECRET="TybKWA7yshd59ovSAj4iqG99LlFTUJWGIlXHfVVpF6iGfiOiXqxNArHvWgNvAsCk"
MPESA_SANDBOX_SHORTCODE="174379"
MPESA_SANDBOX_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
```

### Test Phone Number
Use: **254708374149** with any 4-digit PIN

---

## 🧪 Testing in Sandbox

### Step 1: Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_payment_model
npx prisma generate
```

### Step 2: Start Backend
```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:4000`

### Step 3: Start Frontend
```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

### Step 4: Test Payment Flow

1. **Complete a Module**:
   - Go to `/learn`
   - Complete all lessons and pass the certification exam
   - Certificate will be generated

2. **Navigate to Certificate**:
   - Go to your dashboard
   - Click on the certificate
   - You'll see **"Pay KES 646.80 to Download"** button

3. **Initiate Payment**:
   - Click the payment button
   - Enter test phone: **254708374149**
   - Click "Pay"

4. **Check Logs**:
   - Backend logs will show STK Push initiated
   - In sandbox, payment is auto-completed after ~30 seconds
   - You'll see "Payment Successful!" message

5. **Download Certificate**:
   - Download button will appear
   - Click to download PDF

### Sandbox Behavior
- Payments complete automatically after 30-60 seconds
- No real money is charged
- Test as many times as you want

---

## 🚀 Going to Production (SINGLE LINE CHANGE)

### Step 1: Get Production Credentials from Safaricom

You need to wait for Safaricom to approve your production app and provide:
- ✅ Production Consumer Key
- ✅ Production Consumer Secret
- ✅ Production Passkey
- ✅ Production Shortcode (your till: **9334506**)

This usually takes **2-7 business days** after submitting your production app request.

### Step 2: Update Environment Variables

Open `/backend/.env` and update ONLY these lines:

```env
# Production Credentials (Replace these with Safaricom's values)
MPESA_PRODUCTION_CONSUMER_KEY="your_actual_production_consumer_key"
MPESA_PRODUCTION_CONSUMER_SECRET="your_actual_production_consumer_secret"
MPESA_PRODUCTION_SHORTCODE="9334506"
MPESA_PRODUCTION_PASSKEY="your_actual_production_passkey"

# Update callback URL to your deployed backend
MPESA_CALLBACK_URL="https://your-actual-backend.onrender.com/api/payment/callback"
```

### Step 3: THE SINGLE LINE SWITCH 🔥

To switch from sandbox to production, change **ONE LINE**:

```env
# Change this line in /backend/.env:
MPESA_ENVIRONMENT=sandbox

# To this:
MPESA_ENVIRONMENT=production
```

**That's it!** Restart your backend and you're live! 🎉

---

## 📁 Files Created/Modified

### New Backend Files
```
backend/
├── src/
│   ├── services/
│   │   └── mpesa.service.ts          # M-Pesa STK Push service
│   └── routes/
│       └── payment.routes.ts         # Payment API endpoints
├── prisma/
│   └── schema.prisma                 # Added Payment model
└── .env                              # M-Pesa configuration
```

### New Frontend Files
```
components/
└── PaymentModal.tsx                  # Payment UI component

lib/hooks/
└── usePayment.ts                     # Payment React Query hooks

app/certificate/[certificateId]/
└── page.tsx                          # Updated with payment gate
```

### Modified Files
```
backend/src/index.ts                  # Registered payment routes
```

---

## 🔌 API Endpoints

### POST `/api/payment/initiate`
Initiate STK Push payment

**Request:**
```json
{
  "certificateId": "cert_abc123",
  "phoneNumber": "254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "STK Push initiated...",
  "data": {
    "paymentId": "pay_xyz789",
    "checkoutRequestId": "ws_CO_123456",
    "amount": 646.80
  }
}
```

### POST `/api/payment/callback`
M-Pesa webhook (called automatically)

### GET `/api/payment/status/:checkoutRequestId`
Check payment status

### GET `/api/payment/certificate/:certificateId`
Check if certificate is paid for

---

## 🔒 Security Features

- ✅ JWT authentication required
- ✅ Ownership verification (user can only pay for their certificates)
- ✅ Duplicate payment prevention
- ✅ Secure callback handling
- ✅ Transaction logging
- ✅ Environment-based credentials

---

## 📊 Payment Flow Diagram

```
User                    Frontend                Backend                 M-Pesa
 |                         |                      |                       |
 |--[Click Pay]---------->|                      |                       |
 |                         |--[POST /initiate]--->|                       |
 |                         |                      |--[STK Push Request]-->|
 |                         |                      |<---[CheckoutReqID]---|
 |                         |<--[CheckoutReqID]---|                       |
 |                         |                      |                       |
 |<-----[M-Pesa Prompt]--------------------------------[STK Push]--------|
 |                         |                      |                       |
 |--[Enter PIN]--------------------------------------------[Confirm]----->|
 |                         |                      |                       |
 |                         |                      |<---[Callback]---------|
 |                         |                      |--[Update DB: PAID]--->|
 |                         |                      |                       |
 |                         |--[Poll status]------>|                       |
 |                         |<--[Status: PAID]-----|                       |
 |                         |                      |                       |
 |<--[Show Success]--------|                      |                       |
 |<--[Enable Download]-----|                      |                       |
```

---

## 🐛 Troubleshooting

### Backend Not Receiving Callbacks

**Problem**: Payment completes but status stays "PENDING"

**Solution**: Your callback URL must be publicly accessible. For local testing:
1. Use ngrok: `ngrok http 4000`
2. Update `MPESA_CALLBACK_URL` in `.env` to ngrok URL
3. Restart backend

### "Wrong Credentials" Error

**Problem**: Getting authentication errors

**Solution**:
- Verify Consumer Key and Consumer Secret are correct
- Check you're using the right environment credentials
- Ensure no extra spaces in `.env` file

### Payment Status Polling Not Working

**Problem**: Frontend not updating payment status

**Solution**:
- Check browser console for errors
- Verify JWT token is valid
- Ensure backend is running

### Database Connection Error

**Problem**: Prisma can't connect to database

**Solution**:
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

---

## 💰 Fees & Costs

### Sandbox (Testing)
- **Cost**: FREE ✅
- **Transaction Limit**: KES 1,000
- **Restrictions**: No real money

### Production (Live)
- **M-Pesa Fee**: ~0.5% (max KES 100 per transaction)
- **Your Till**: 9334506
- **Example**: User pays KES 646.80 → You receive KES 643.50

---

## 📞 Support Contacts

### Safaricom Daraja Support
- **Portal**: https://developer.safaricom.co.ke/
- **Email**: apisupport@safaricom.co.ke
- **Phone**: 0722 000 000 / 0734 000 000

### Production Approval Status
Check your Daraja dashboard → My Apps → [Your Production App]

---

## ✅ Pre-Launch Checklist

Before switching to production:

- [ ] Safaricom production approval received
- [ ] Production credentials added to `.env`
- [ ] Callback URL updated to live backend URL
- [ ] Backend deployed and accessible
- [ ] Database migration run on production DB
- [ ] Test one sandbox payment successfully
- [ ] Changed `MPESA_ENVIRONMENT=production`
- [ ] Tested with real phone number (small amount first!)

---

## 🎉 You're All Set!

Your M-Pesa integration is **production-ready**. Just wait for Safaricom's approval, add the production credentials, and flip the switch!

**Questions?** Check the code comments or Safaricom Daraja documentation.

**Happy Coding! 🚀**

---

## 📝 Code Architecture Highlights

### Clean Separation of Concerns
- **Service Layer**: All M-Pesa logic in `mpesa.service.ts`
- **Route Layer**: API endpoints in `payment.routes.ts`
- **Frontend Hooks**: React Query abstraction in `usePayment.ts`
- **UI Components**: Reusable PaymentModal

### Environment-Based Configuration
```typescript
const isSandbox = process.env.MPESA_ENVIRONMENT === 'sandbox';
const baseUrl = isSandbox
  ? 'https://sandbox.safaricom.co.ke'
  : 'https://api.safaricom.co.ke';
```

### Automatic Callback Handling
- Webhook endpoint receives M-Pesa callbacks
- Updates payment status in database
- Frontend polls for status changes
- Fallback: Manual status query after 60s

### Phone Number Formatting
Automatically handles:
- `0712345678` → `254712345678`
- `+254712345678` → `254712345678`
- `712345678` → `254712345678`

---

**Built with ❤️ for Cogniwise Artificial Intelligence Literacy**
