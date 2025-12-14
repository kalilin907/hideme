// server.js
require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // put index.html, styles, script into public/
const PORT = process.env.PORT || 3000;

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET
});

// Create order endpoint
app.post('/create_order', async (req, res) => {
  const { amount, name, email, phone, domain } = req.body;
  // amount is in paise (integer)
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  try {
    const options = {
      amount: amount, // paise
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      payment_capture: 1 // auto-capture; set to 0 if you want manual capture
    };

    const order = await razorpay.orders.create(options);
    // Return order details and your key id so client can present checkout
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY_ID
    });

  } catch (err) {
    console.error('create_order err', err);
    res.status(500).json({ error: 'order creation failed' });
  }
});

// Verify payment - backend should verify signature
app.post('/verify_payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, metadata } = req.body;
  const generated_signature = crypto.createHmac('sha256', process.env.RZP_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Save payment & registration details to DB here
    console.log('Payment verified for', metadata);
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
