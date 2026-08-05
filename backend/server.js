const express = require('express');
 require('dotenv').config();
const cors = require('cors');
// const nodemailer = require('nodemailer');
const db = require('./config/db');
if (process.env.NODE_ENV !== 'production') {
}
console.log("--- DÉMARRAGE DU SERVEUR ---");
const app = express();

// Configuration CORS optimisée pour accepter toutes les origines
app.use(cors({
  origin: 'https://mickaelbrouttier-max.github.io', // Ton domaine exact
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
// Forcer le fuseau horaire
db.query("SET time_zone = '+02:00'").catch(err => {
  console.error("⚠️ Impossible de forcer le fuseau horaire (Problème de connexion BDD) :", err.message);
});

/*
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true, 
  logger: true 
});
*/

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

const { nom_client, email_client, telephone_client, prestation, date_debut, date_fin, remarques, user_id } = req.body;

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
    let isFirstReservation = false;
    if (user_id) {
      const [existingRes] = await db.query("SELECT id FROM reservations WHERE user_id = ?", [user_id]);
      if (existingRes.length === 0) {
        isFirstReservation = true;
      }
    }

    const sql = `INSERT INTO reservations 
                (nom_client, email_client, telephone_client, prestation, date_debut, date_fin, remarques, user_id) 
                VALUES (?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'), STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'), ?, ?)`;
    
    await db.query(sql, [nom_client, email_client, telephone_client, prestation, dateDebutString, dateFinString, remarques || '', user_id || null]);

    if (isFirstReservation) {
      // Première réservation d’une séance -> 50 points bonus
      await db.query("UPDATE users SET points = points + 50 WHERE id = ?", [user_id]);
    }

    // Envoi de l'e-mail en arrière-plan sans bloquer la réponse client via l'API Brevo (HTTPS)
    if (process.env.BREVO_API_KEY) {
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: "Réservations CombatFit", email: "combatfit.coaching@gmail.com" },
          to: [
            { email: email_client, name: nom_client },
            { email: "combatfit.coaching@gmail.com", name: "CombatFit Coaching" },
            { email: "mickael.brouttier@gmail.com", name: "Mickaël Brouttier" }
          ],
          subject: "Confirmation de votre rendez-vous",
          textContent: `Bonjour ${nom_client}, votre créneau pour ${prestation} est confirmé le ${date_debut} à ${date_fin}. Mathias vous recontactera au : ${telephone_client}.`
        })
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errText => {
            console.error("Erreur réponse Brevo API :", errText);
          });
        }
        console.log("Email de confirmation envoyé avec succès via Brevo API.");
      })
      .catch((mailErr) => {
        console.error("ERREUR lors de l'envoi de l'email via Brevo API :", mailErr);
      });
    } else {
      console.warn("BREVO_API_KEY non configurée. Envoi d'e-mail ignoré.");
    }

    res.status(200).json({ success: true, message: "Réservation réussie !" });

  } catch (err) {
    console.error("ERREUR POST :", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement en base de données." });
  }
});

// ==========================================
// CODE D'AUTHENTIFICATION & ESPACE MEMBRE
// ==========================================

const crypto = require('crypto');

// Hachage de mot de passe simple et robuste avec crypto (SHA-256)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Génération de Token JWT léger et fait maison
function generateToken(userId, email) {
  const payload = JSON.stringify({ id: userId, email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const base64Payload = Buffer.from(payload).toString('base64');
  const signature = crypto.createHmac('sha256', 'combatfit-secret-key-12345').update(base64Payload).digest('hex');
  return `${base64Payload}.${signature}`;
}

// Vérification de Token JWT léger et fait maison
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [base64Payload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', 'combatfit-secret-key-12345').update(base64Payload).digest('hex');
  if (signature !== expectedSignature) return null;
  try {
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Middleware de protection des routes membres
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Accès non autorisé" });
  
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Session expirée ou invalide" });
  
  req.user = payload;
  next();
}

// Route d'inscription (Signup)
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, nom, prenom, telephone, codeParrain } = req.body;
  if (!email || !password || !nom || !prenom) {
    return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Cet e-mail est déjà utilisé." });
    }

    // Gestion du parrain s'il y a un code
    let parrainId = null;
    if (codeParrain && codeParrain.trim()) {
      const [parrain] = await db.query("SELECT id FROM users WHERE code_parrainage = ?", [codeParrain.trim()]);
      if (parrain.length > 0) {
        parrainId = parrain[0].id;
      }
    }

    // Générer un code de parrainage unique pour le nouvel inscrit
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const codeParrainage = `${prenom.substring(0,3).toUpperCase()}${randomSuffix}`;

    const passwordHash = hashPassword(password);
    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, nom, prenom, telephone, parrain_id, code_parrainage, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [email, passwordHash, nom, prenom, telephone || '', parrainId, codeParrainage, 10]
    );

    const newUserId = result.insertId;

    // Si parrainage réussi, on attribue des points au parrain (Parrainer un ami -> 200 points)
    if (parrainId) {
      // Le parrain gagne 200 points (trophées)
      await db.query("UPDATE users SET points = points + 200 WHERE id = ?", [parrainId]);
      
      // Vérifier et débloquer le badge de parrainage du parrain
      const [badge] = await db.query("SELECT id FROM badges WHERE type = 'parrainage' LIMIT 1");
      if (badge.length > 0) {
        await db.query("INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)", [parrainId, badge[0].id]);
      }
    }

    // Générer le token
    const token = generateToken(newUserId, email);
    res.status(201).json({ token, user: { id: newUserId, email, nom, prenom, level: 1, xp: 0, points: 10, code_parrainage: codeParrainage } });
  } catch (err) {
    console.error("Erreur Inscription :", err);
    res.status(500).json({ error: "Erreur serveur lors de la création du compte.", details: err.message });
  }
});

// Route de connexion (Login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Veuillez remplir tous les champs." });
  }

  try {
    const passwordHash = hashPassword(password);
    const [users] = await db.query("SELECT * FROM users WHERE email = ? AND password_hash = ?", [email, passwordHash]);
    if (users.length === 0) {
      return res.status(400).json({ message: "E-mail ou mot de passe incorrect." });
    }

    const user = users[0];
    
    // Mettre à jour l'XP de l'utilisateur de manière rétroactive si des réservations passées n'ont pas encore été créditées
    const [pastUncredited] = await db.query(
      "SELECT id FROM reservations WHERE (email_client = ? OR user_id = ?) AND date_debut < NOW() AND xp_awarded = FALSE",
      [email, user.id]
    );

    if (pastUncredited.length > 0) {
      const xpGagnee = pastUncredited.length * 50; // 50 XP par séance passée
      const totalXp = user.xp + xpGagnee;
      
      // Formule simple de niveau : niveau = Math.floor(xp / 100) + 1
      const nouveauNiveau = Math.floor(totalXp / 100) + 1;
      
      // Trophées gagnés : 10 points par séance passée
      let pointsGagnes = pastUncredited.length * 10;
      
      // Bonus de 100 points pour la première séance réalisée !
      const [pastCredited] = await db.query(
        "SELECT id FROM reservations WHERE (email_client = ? OR user_id = ?) AND date_debut < NOW() AND xp_awarded = TRUE",
        [email, user.id]
      );
      if (pastCredited.length === 0) {
        pointsGagnes += 100;
      }

      const nouveauxPoints = user.points + pointsGagnes;

      await db.query(
        "UPDATE users SET xp = ?, niveau = ?, points = ? WHERE id = ?",
        [totalXp, nouveauNiveau, nouveauxPoints, user.id]
      );
      
      // Marquer ces réservations comme créditées
      const reservationIds = pastUncredited.map(r => r.id);
      await db.query(
        "UPDATE reservations SET xp_awarded = TRUE, user_id = ? WHERE id IN (?)",
        [user.id, reservationIds]
      );

      // Mettre à jour l'objet utilisateur local
      user.xp = totalXp;
      user.niveau = nouveauNiveau;
      user.points = nouveauxPoints;
    }

    // Vérifier les badges d'assiduité débloqués
    const [completedCountResult] = await db.query(
      "SELECT COUNT(*) as count FROM reservations WHERE (email_client = ? OR user_id = ?) AND date_debut < NOW()",
      [email, user.id]
    );
    const totalCompleted = completedCountResult[0].count;

    // Débloquer les badges correspondants
    const [eligibleBadges] = await db.query(
      "SELECT id FROM badges WHERE type = 'seances' AND seuil <= ?",
      [totalCompleted]
    );
    for (const b of eligibleBadges) {
      await db.query("INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)", [user.id, b.id]);
    }

    const token = generateToken(user.id, user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        level: user.niveau,
        xp: user.xp,
        points: user.points,
        code_parrainage: user.code_parrainage
      }
    });
  } catch (err) {
    console.error("Erreur Connexion :", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

// Route Profil (Profil complet)
app.get('/api/member/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, email, nom, prenom, telephone, xp, points, niveau, code_parrainage FROM users WHERE id = ?", [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
    
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Réservations du membre
app.get('/api/member/reservations', authMiddleware, async (req, res) => {
  try {
    const [user] = await db.query("SELECT email FROM users WHERE id = ?", [req.user.id]);
    if (user.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Récupérer toutes les réservations correspondantes à l'email ou au user_id
    const [rows] = await db.query(
      "SELECT * FROM reservations WHERE email_client = ? OR user_id = ? ORDER BY date_debut DESC",
      [user[0].email, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Historique des statistiques de progression du membre
app.get('/api/member/stats', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM user_stats WHERE user_id = ? ORDER BY date ASC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Enregistrement de nouvelles statistiques
app.post('/api/member/stats', authMiddleware, async (req, res) => {
  const { poids, force_pompes, endurance_gainage, souplesse, cardio_vo2 } = req.body;
  
  try {
    const date = new Date().toISOString().split('T')[0]; // Date du jour
    
    // Insérer la nouvelle mesure
    await db.query(
      "INSERT INTO user_stats (user_id, date, poids, force_pompes, endurance_gainage, souplesse, cardio_vo2) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, date, poids || null, force_pompes || null, endurance_gainage || null, souplesse || null, cardio_vo2 || null]
    );

    // Attribution de points/badges de performance si les seuils sont atteints
    if (force_pompes && force_pompes >= 50) {
      const [badge] = await db.query("SELECT id FROM badges WHERE type = 'perf_pompes' LIMIT 1");
      if (badge.length > 0) {
        await db.query("INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)", [req.user.id, badge[0].id]);
      }
    }
    if (endurance_gainage && endurance_gainage >= 180) {
      const [badge] = await db.query("SELECT id FROM badges WHERE type = 'perf_gainage' LIMIT 1");
      if (badge.length > 0) {
        await db.query("INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)", [req.user.id, badge[0].id]);
      }
    }

    res.json({ success: true, message: "Mesures enregistrées avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Badges (Tous les badges avec statut Débloqué / Verrouillé)
app.get('/api/member/badges', authMiddleware, async (req, res) => {
  try {
    // Récupérer tous les badges
    const [allBadges] = await db.query("SELECT * FROM badges");
    // Récupérer les badges débloqués par l'utilisateur
    const [unlockedBadges] = await db.query("SELECT badge_id FROM user_badges WHERE user_id = ?", [req.user.id]);
    const unlockedIds = unlockedBadges.map(ub => ub.badge_id);

    const result = allBadges.map(badge => ({
      ...badge,
      unlocked: unlockedIds.includes(badge.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Boutique de cadeaux (Liste des récompenses)
app.get('/api/rewards', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM rewards WHERE stock > 0 OR stock = -1");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Échange de points contre récompense
app.post('/api/rewards/redeem', authMiddleware, async (req, res) => {
  const { rewardId } = req.body;
  if (!rewardId) return res.status(400).json({ message: "ID de récompense manquant." });

  try {
    // 1. Récupérer l'utilisateur
    const [users] = await db.query("SELECT points FROM users WHERE id = ?", [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
    const pointsUser = users[0].points;

    // 2. Récupérer la récompense
    const [rewards] = await db.query("SELECT * FROM rewards WHERE id = ?", [rewardId]);
    if (rewards.length === 0) return res.status(404).json({ message: "Récompense introuvable" });
    const r = rewards[0];

    // 3. Vérifier le stock
    if (r.stock === 0) return res.status(400).json({ message: "Cette récompense est en rupture de stock." });

    // 4. Vérifier si l'utilisateur a assez de points
    if (pointsUser < r.cout_points) {
      return res.status(400).json({ message: `Points insuffisants. Vous avez besoin de ${r.cout_points} points.` });
    }

    // 5. Procéder à l'échange
    // Déduire les points de l'utilisateur
    await db.query("UPDATE users SET points = points - ? WHERE id = ?", [r.cout_points, req.user.id]);
    // Déduire le stock si ce n'est pas infini
    if (r.stock > 0) {
      await db.query("UPDATE rewards SET stock = stock - 1 WHERE id = ?", [r.id]);
    }
    // Créer la demande d'échange
    await db.query("INSERT INTO user_rewards (user_id, reward_id, statut) VALUES (?, ?, 'demande')", [req.user.id, r.id]);

    res.json({ success: true, message: `Félicitations ! Vous avez échangé ${r.cout_points} points contre : ${r.nom}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route de mise à jour du profil (Compléter son profil -> 🏆 10)
app.put('/api/member/profile', authMiddleware, async (req, res) => {
  const { nom, prenom, telephone } = req.body;
  if (!nom || !prenom || !telephone) {
    return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
  }
  
  try {
    const [user] = await db.query("SELECT profil_complete FROM users WHERE id = ?", [req.user.id]);
    if (user.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
    
    let pointsBonus = 0;
    let setCompleted = "";
    if (!user[0].profil_complete) {
      pointsBonus = 10;
      setCompleted = ", profil_complete = TRUE, points = points + 10";
    }
    
    await db.query(
      `UPDATE users SET nom = ?, prenom = ?, telephone = ?${setCompleted} WHERE id = ?`,
      [nom, prenom, telephone, req.user.id]
    );
    
    res.json({ success: true, pointsBonus, message: "Profil mis à jour avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
});

// Route Visite objectifs (Visiter la page objectifs -> 🏆 5)
app.post('/api/member/objectives/visit', authMiddleware, async (req, res) => {
  try {
    const [user] = await db.query("SELECT objectifs_visites FROM users WHERE id = ?", [req.user.id]);
    if (user.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
    
    let pointsBonus = 0;
    if (!user[0].objectifs_visites) {
      pointsBonus = 5;
      await db.query("UPDATE users SET objectifs_visites = TRUE, points = points + 5 WHERE id = ?", [req.user.id]);
    }
    
    res.json({ success: true, pointsBonus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Acheter un pack (Acheter un pack -> 🏆 150)
app.post('/api/member/buy-pack', authMiddleware, async (req, res) => {
  try {
    await db.query("UPDATE users SET points = points + 150 WHERE id = ?", [req.user.id]);
    res.json({ success: true, message: "Félicitations ! Vous avez acheté un pack d'entraînement : +150 Trophées !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Laisser un avis (Laisser un avis -> 🏆 50)
app.post('/api/member/review', authMiddleware, async (req, res) => {
  const { reservationId, avis } = req.body;
  if (!reservationId || !avis) {
    return res.status(400).json({ message: "Paramètres manquants." });
  }
  
  try {
    const [resv] = await db.query("SELECT id, user_id, avis_laisse FROM reservations WHERE id = ?", [reservationId]);
    if (resv.length === 0) return res.status(404).json({ message: "Réservation non trouvée" });
    
    if (resv[0].avis_laisse) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis pour cette séance." });
    }
    
    // Mettre à jour la réservation et ajouter 50 points
    await db.query("UPDATE reservations SET avis_laisse = TRUE, remarques = CONCAT(remarques, '\n[Avis] : ', ?) WHERE id = ?", [avis, reservationId]);
    await db.query("UPDATE users SET points = points + 50 WHERE id = ?", [req.user.id]);
    
    res.json({ success: true, message: "Merci pour votre avis ! +50 Trophées !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur actif sur port ${PORT}`);
});
