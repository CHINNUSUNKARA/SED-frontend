const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;