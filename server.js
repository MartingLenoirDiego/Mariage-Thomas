require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { ciphers: 'SSLv3' },
});

const presenceLabels = { oui: '✅ Sera présent(e) avec joie !', non: '❌ Ne pourra pas venir' };
const repasLabels = { standard: 'Aucune contrainte', vege: 'Végétarien', vegan: 'Vegan', autre: 'Allergie / autre' };

app.post('/api/rsvp', async (req, res) => {
  const { prenom, nom, email, presence, repas, message } = req.body;

  if (!prenom || !nom || !email || !presence) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2c2118;">
      <div style="background:#2c2118;padding:2rem;text-align:center;">
        <h1 style="color:#c9a96e;font-size:1.6rem;margin:0;">Thomas &amp; Céline</h1>
        <p style="color:#b5967a;font-size:.85rem;margin:.5rem 0 0;letter-spacing:.1em;">MARIAGE · 14 JUIN 2026</p>
      </div>
      <div style="padding:2rem;background:#faf7f2;border:1px solid #e8cfc0;">
        <h2 style="color:#6b4f3a;font-size:1.2rem;margin-top:0;">Nouveau RSVP reçu</h2>
        <table style="width:100%;border-collapse:collapse;font-size:.9rem;">
          <tr><td style="padding:.5rem 0;color:#b5967a;width:35%;">Nom</td><td style="padding:.5rem 0;font-weight:bold;">${prenom} ${nom}</td></tr>
          <tr><td style="padding:.5rem 0;color:#b5967a;">Email</td><td style="padding:.5rem 0;">${email}</td></tr>
          <tr><td style="padding:.5rem 0;color:#b5967a;">Présence</td><td style="padding:.5rem 0;">${presenceLabels[presence] || presence}</td></tr>
          ${repas ? `<tr><td style="padding:.5rem 0;color:#b5967a;">Régime</td><td style="padding:.5rem 0;">${repasLabels[repas] || repas}</td></tr>` : ''}
          ${message ? `<tr><td style="padding:.5rem 0;color:#b5967a;vertical-align:top;">Message</td><td style="padding:.5rem 0;font-style:italic;">"${message}"</td></tr>` : ''}
        </table>
      </div>
      <div style="background:#e8cfc0;padding:1rem;text-align:center;font-size:.75rem;color:#6b4f3a;">
        Reçu via le site mariage Thomas &amp; Céline
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Mariage Thomas & Céline" <${process.env.MAIL_USER}>`,
      to: 'dmarting@hotmail.be',
      subject: `RSVP — ${prenom} ${nom} (${presenceLabels[presence] || presence})`,
      html,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur envoi email:', err.message);
    res.status(500).json({ error: 'Impossible d\'envoyer le mail' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
