import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  purchase_datetime: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String,
    required: true // email del comprador
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Método para formato legible
ticketSchema.methods.toJSON = function() {
  const ticket = this.toObject();
  ticket.id = ticket._id;
  delete ticket._id;
  delete ticket.__v;
  return ticket;
};

export default mongoose.model('Ticket', ticketSchema);