/* ============================================================
   Configuración de la alerta del semáforo S.E.R
   Cuando se marca ROJO en Físico, Mental y Espiritual,
   se envía al instante un email al coordinador.
   Completá los 4 valores entre las comillas y guardá.
   ============================================================ */
window.SER_CONFIG = {

  email: {
    serviceId:  "service_0aorj1r",   // EmailJS > Email Services  (ej: "service_ab12cd3")
    templateId: "template_qurut9j",   // EmailJS > Email Templates (ej: "template_xy98zt7")
    publicKey:  "cUTRjuUVwYX8noamx",   // EmailJS > Account > Public Key (ej: "Ab1Cd2Ef3Gh4Ij5K")
    to:         "Camilanoguera6@gmail.com"    // Email que recibe la alerta (ej: "tunombre@gmail.com")
  }

};
