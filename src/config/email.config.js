import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Para testing, si no hay configuración de email, creamos un transporter de prueba
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  // Configuración real con Gmail
  transporter = nodemailer.createTransport({  // ✅ CORREGIDO: createTransport
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  // Configuración de prueba (ethereal.email)
  console.log('⚠️  Usando email de prueba - Configura Gmail en .env para emails reales');
  transporter = nodemailer.createTransport({  // ✅ CORREGIDO: createTransport
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@ethereal.email',
      pass: 'test',
    },
  });
}

// Verificar la configuración
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error configurando email:', error.message);
    console.log('💡 Para emails reales, configura EMAIL_USER y EMAIL_PASS en .env');
  } else {
    console.log('✅ Servidor de email listo');
  }
});

export default transporter;