export default class UserDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.cart = user.cart;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  // Método estático para crear DTO sin información sensible
  static fromUser(user) {
    if (!user) return null;
    
    return new UserDTO({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role,
      cart: user.cart,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }

  // Método para respuesta pública (sin datos sensibles)
  toJSON() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      age: this.age,
      role: this.role,
      cart: this.cart,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}