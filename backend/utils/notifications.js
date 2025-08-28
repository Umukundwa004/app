const axios = require('axios');

// Send SMS notification (would integrate with an SMS service in production)
const sendSMS = async (phone, message) => {
  try {
    // This is a simulation - in production, you would use a service like Twilio, Africa's Talking, etc.
    console.log(`SMS to ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
};

// Send email notification (would integrate with an email service in production)
const sendEmail = async (email, subject, message) => {
  try {
    // This is a simulation - in production, you would use a service like SendGrid, Mailgun, etc.
    console.log(`Email to ${email} [${subject}]: ${message}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// Send push notification (would integrate with a push notification service in production)
const sendPushNotification = async (userId, title, body) => {
  try {
    // This is a simulation - in production, you would use Firebase Cloud Messaging or similar
    console.log(`Push notification to user ${userId}: ${title} - ${body}`);
    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
};

// Notify user about order status update
const notifyOrderStatusUpdate = async (order, user) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    preparing: 'Your order is being prepared.',
    out_for_delivery: 'Your order is out for delivery and will arrive soon.',
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled.'
  };
  
  const message = statusMessages[order.status] || `Your order status has been updated to: ${order.status}`;
  
  // Send SMS
  await sendSMS(user.phone, `Order #${order._id}: ${message}`);
  
  // Send email
  await sendEmail(
    user.email,
    `Order Update - #${order._id}`,
    `Dear ${user.name},\n\n${message}\n\nThank you for shopping with FreshProduce!`
  );
  
  // Send push notification
  await sendPushNotification(user._id, 'Order Update', message);
};

module.exports = {
  sendSMS,
  sendEmail,
  sendPushNotification,
  notifyOrderStatusUpdate
};