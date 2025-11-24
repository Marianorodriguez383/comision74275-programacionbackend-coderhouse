import transporter from '../config/email.config.js';

export class EmailService {
  static async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/api/sessions/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: email,
        subject: 'Recuperación de Contraseña - Ecommerce',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Recuperación de Contraseña</h2>
            <p>Hola ${userName},</p>
            <p>Has solicitado restablecer tu contraseña. Usa el siguiente token:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <code style="font-size: 18px; font-weight: bold;">${resetToken}</code>
            </div>
            <p>O visita este enlace:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p><strong>Este token expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          </div>
        `,
        text: `Recuperación de contraseña para ${userName}. Token: ${resetToken}. Enlace: ${resetLink}`
      };

      // ✅ SIEMPRE mostrar el token en consola para testing
      console.log('='.repeat(60));
      console.log('🔐 TOKEN DE RECUPERACIÓN (PARA TESTING):');
      console.log('Token:', resetToken);
      console.log('Enlace:', resetLink);
      console.log('='.repeat(60));

      // Solo enviar email real si está configurado
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email de recuperación enviado a:', email);
        return result;
      } else {
        console.log('📧 Email simulado - Configura Gmail en .env para envío real');
        return { message: 'Email simulado para testing' };
      }
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      // Pero igual mostramos el token para testing
      console.log('🔐 TOKEN (a pesar del error):', resetToken);
      return { error: 'Email no enviado, pero token generado' };
    }
  }
}