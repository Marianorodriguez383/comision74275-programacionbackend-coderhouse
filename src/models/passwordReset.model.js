import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    index: { expires: '1h' }, // Expira automáticamente después de 1 hora
  },
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Método para verificar si el token es válido
passwordResetSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

export default mongoose.model('PasswordReset', passwordResetSchema);