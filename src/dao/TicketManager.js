import Ticket from '../models/Ticket.js';

class TicketManager {
  async createTicket(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      await ticket.save();
      return ticket;
    } catch (error) {
      throw new Error(`Error creating ticket: ${error.message}`);
    }
  }

  async getTicketById(ticketId) {
    try {
      return await Ticket.findById(ticketId).populate('products.product');
    } catch (error) {
      throw new Error(`Error getting ticket: ${error.message}`);
    }
  }

  async getTicketsByUser(email) {
    try {
      return await Ticket.find({ purchaser: email })
        .populate('products.product')
        .sort({ purchase_datetime: -1 });
    } catch (error) {
      throw new Error(`Error getting user tickets: ${error.message}`);
    }
  }
}

export default TicketManager;