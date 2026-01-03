import dotenv from "dotenv";
dotenv.config();
console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
console.log("ENV FILE LOADED FROM:", process.cwd());

import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";
import fetch from "node-fetch";


const app = express();
app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // convert to paise
            currency: "INR",
            receipt: `order_${Date.now()}`
        });

        console.log("✅ Razorpay Order Created:", order.id);
        console.log("📦 Sending order to client:", order);
        return res.status(200).json({ order });
    } catch (err) {
        console.error("❌ Create order error:", err);
        console.error("RAZORPAY FULL ERROR:", err);
        return res.status(500).json({ message: "Order creation failed", error: err.message });
    }
});

app.post("/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        return res.json({ success: true });
    }

    res.json({ success: false });
});

app.post("/create-cod-order", async (req, res) => {
    try {
        const { cart, items, address, total } = req.body;

        const orderItems = (items || cart || []).map(item => ({
            productId: item?.id || item?.productId || item?.product?.id,
            name: item?.name || item?.product?.name || item?.title,
            size: item?.selectedSize || item?.size,
            color: item?.selectedColor || item?.color,
            price: item?.price || item?.product?.price,
            quantity: item?.quantity,
            image: item?.image || item?.imageUrl || item?.thumbnail || item?.product?.image || item?.product?.imageUrls?.[0]
        }));

        const order = {
            items: orderItems,
            address,
            total,
            paymentType: "COD",
            paymentStatus: "PENDING",
            createdAt: new Date(),
        };

        return res.json({ success: true, order });
    } catch (err) {
        console.error("COD Order Error:", err);
        res.status(500).json({ success: false });
    }
});

async function sendWhatsAppMessage(phone, message) {
    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: phone,
                    type: "text",
                    text: { body: message },
                }),
            }
        );
        const data = await response.json();
        console.log("WhatsApp API Response:", data);
    } catch (error) {
        console.error("WhatsApp Message Error:", error);
    }
}

app.post("/confirm-order-whatsapp", async (req, res) => {
    const { phone, name, id, total } = req.body;
    try {
        await sendWhatsAppMessage(phone, `Hi ${name} 👋

Your order has been placed successfully!

Order ID: ${id}
Amount: ₹${total}

We will notify you once shipped 🚚`);
        return res.json({ success: true });
    } catch (err) {
        console.error("WhatsApp Route Error:", err);
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Razorpay server running on http://localhost:${PORT}`)
);
