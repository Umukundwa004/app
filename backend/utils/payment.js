const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Initiate Momo payment
router.post('/momo', auth, async (req, res) => {
  try {
    const { orderId, phone } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // In a real implementation, you would integrate with the Momo API here
    // This is a simulation of the process
    
    // Simulate Momo payment request
    const paymentRequest = {
      amount: Math.round((order.totalAmount + order.deliveryFee) * 100), // Convert to cents
      currency: 'RWF',
      externalId: orderId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone
      },
      payerMessage: `Payment for order #${orderId}`,
      payeeNote: `Thank you for your order from FreshProduce`
    };
    
    // Simulate successful payment request
    // In reality, you would get a response from the Momo API
    const simulatedResponse = {
      referenceId: `MOMO_${Date.now()}`,
      status: 'PENDING'
    };
    
    // Update order with payment reference
    order.paymentId = simulatedResponse.referenceId;
    await order.save();
    
    res.json({
      message: 'Momo payment request sent. Please check your phone to confirm.',
      reference: simulatedResponse.referenceId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process card payment with Stripe
router.post('/card', auth, async (req, res) => {
  try {
    const { orderId, token } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Create charge with Stripe
    const charge = await stripe.charges.create({
      amount: Math.round((order.totalAmount + order.deliveryFee) * 100), // Convert to cents
      currency: 'usd', // Would be RWF in production
      source: token,
      description: `Order #${orderId} from FreshProduce`
    });
    
    // Update order payment status
    order.paymentStatus = 'completed';
    order.paymentId = charge.id;
    await order.save();
    
    res.json({
      message: 'Payment successful',
      chargeId: charge.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Webhook for Momo payment notifications (simulated)
router.post('/momo-webhook', async (req, res) => {
  try {
    // In a real implementation, this would verify the webhook signature
    const { referenceId, status } = req.body;
    
    // Find order by payment reference
    const order = await Order.findOne({ paymentId: referenceId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status based on payment result
    if (status === 'SUCCESSFUL') {
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
    } else if (status === 'FAILED') {
      order.paymentStatus = 'failed';
    }
    
    await order.save();
    
    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;