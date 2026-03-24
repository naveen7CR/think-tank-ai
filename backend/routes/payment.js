// backend/routes/payment.js - Complete Stripe Integration
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');

// Create payment intent for a session
router.post('/create-payment-intent', protect, async (req, res) => {
    try {
        const { amount, sessionId } = req.body;
        
        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid amount' 
            });
        }
        
        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: { 
                sessionId: sessionId,
                userId: req.user.id
            }
        });
        
        res.json({ 
            success: true, 
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
        
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Webhook to handle successful payments (optional)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        // Verify webhook signature (add your webhook secret in .env)
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            event = req.body;
        }
        
        // Handle the event
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const sessionId = paymentIntent.metadata.sessionId;
            
            // Update session status to paid
            await Session.findByIdAndUpdate(sessionId, { 
                paymentStatus: 'paid',
                status: 'active'
            });
            
            console.log(`✅ Payment succeeded for session: ${sessionId}`);
        }
        
        res.json({ received: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

// Confirm payment after successful payment (for client-side)
router.post('/confirm/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await Session.findById(sessionId);
        
        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found' 
            });
        }
        
        // Mark session as paid and active
        session.paymentStatus = 'paid';
        session.status = 'active';
        await session.save();
        
        res.json({ 
            success: true, 
            message: 'Payment confirmed! Session is now active.',
            session: session
        });
        
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to confirm payment' 
        });
    }
});

module.exports = router;
