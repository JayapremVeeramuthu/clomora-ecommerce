# Teemaster Backend Server

Backend API server for handling Razorpay payments and order management.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Setup Firebase Admin SDK

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the downloaded JSON file as `firebase-service-account.json` in the backend folder

### 4. Run the Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```

### Create Razorpay Order
```
POST /api/create-order
Body: {
  amount: number,
  currency: string,
  userId: string,
  userEmail: string,
  items: array,
  shippingAddress: object
}
```

### Verify Payment
```
POST /api/verify-payment
Body: {
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  firestoreOrderId: string
}
```

### Create COD Order
```
POST /api/create-cod-order
Body: {
  amount: number,
  userId: string,
  userEmail: string,
  items: array,
  shippingAddress: object
}
```

## Security

- All payment verification is done server-side
- Razorpay secret key is never exposed to frontend
- Firebase Admin SDK for secure database operations
- CORS configured for specific client URL
