// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');

router.post('/create-payment-intent', protect, async (req, res) => {
    try {
        const { amount, sessionId } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            metadata: { sessionId }
        });
        
        res.json({ 
            success: true, 
            clientSecret: paymentIntent.client_secret 
        });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
