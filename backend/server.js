const express = require('express');
 require('dotenv').config();
const cors = require('cors');
const nodemailer = require('nodemailer');
const db = require('./config/db');
if (process.env.NODE_ENV !== 'production') {
}
console.log("--- DÉMARRAGE DU SERVEUR ---");
const app = express();

// Configuration CORS optimisée pour accepter toutes les origines
app.use(cors({
  origin: 'https://mickaelbrouttier-max.github.io', // Ton domaine exact
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
// Forcer le fuseau horaire
db.query("SET time_zone = '+02:00'");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true, 
  logger: true 
});

// ROUTE GET : Récupération des créneaux occupés pour le calendrier
app.get('/api/reservations', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date manquante" });
    
    const [rows] = await db.query('SELECT date_debut FROM reservations WHERE date_debut LIKE ?', [`${date}%`]);
    res.json(rows);
  } catch (err) {
    console.error("Erreur GET :", err);
    res.status(500).json({ error: err.message });
  }
});

// ROUTE GET : Récupération de TOUTES les réservations (pour l'admin)
app.get('/api/reservations/all', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM reservations");
        res.json(rows);
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ error: "Impossible de récupérer les rendez-vous" });
    }
});

// ROUTE DELETE : Suppression d'un rendez-vous
app.delete('/api/reservations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM reservations WHERE id = ?", [id]);
        res.status(200).json({ message: "Supprimé avec succès" });
    } catch (err) {
        console.error("Erreur DELETE :", err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
});
// ROUTE POST : Création d'une réservation
app.post('/api/reservations', async (req, res) => {
console.log("Données reçues :", req.body); 

const { nom_client, email_client, telephone_client, prestation, date_debut, date_fin, remarques } = req.body;

  // 1. Validation : Vérifie que tous les champs requis sont présents
  if (!nom_client || !email_client || !telephone_client || !prestation || !date_debut || !date_fin) {
    console.log("Validation échouée :", { nom_client, email_client, telephone_client, prestation, date_debut, date_fin });
    return res.status(400).json({ message: "Champs obligatoires manquants." });
  }

  try {
    // 2. Préparation des dates pour MySQL
    // date_debut = 'YYYY-MM-DD' et date_fin = 'HH:mm'
    const dateDebutString = `${date_debut} ${date_fin}:00`; 
    
    // Calcul de la fin de séance (+ 90 minutes)
    const [h, m] = date_fin.split(':').map(Number);
    let endMinutes = m + 90;
    let endHours = h + Math.floor(endMinutes / 60);
    endMinutes = endMinutes % 60;
    
    const timeFinCalculated = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    const dateFinString = `${date_debut} ${timeFinCalculated}:00`;

    // 3. Insertion en base de données
    const sql = `INSERT INTO reservations 
                (nom_client, email_client, telephone_client, prestation, date_debut, date_fin, remarques) 
                VALUES (?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'), STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'), ?)`;
    
    await db.query(sql, [nom_client, email_client, telephone_client, prestation, dateDebutString, dateFinString, remarques || '']);

    await transporter.sendMail({
      from: `"Réservations" <${process.env.EMAIL_USER}>`,
      to: `${email_client}, combatfit.coaching@gmail.com, mickael.brouttier@gmail.com`,
      subject: 'Confirmation de votre rendez-vous',
      text: `Bonjour ${nom_client}, votre créneau pour ${prestation} est confirmé le ${date_debut} à ${date_fin}. Mathias vous recontactera au : ${telephone_client}.`
    });

res.status(200).json({ success: true, message: "Réservation réussie !" });

  } catch (err) {
    console.error("ERREUR POST :", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement en base de données." });
  }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Serveur actif sur port ${PORT}`);
});
