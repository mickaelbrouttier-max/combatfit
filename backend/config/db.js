const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

console.log("Tentative de connexion à la base de données...");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, '../ca.pem')),
    rejectUnauthorized: false
  }
};
console.log("Tentative de connexion à la base de données...");

const db = mysql.createPool(dbConfig);

// Test immédiat de la connexion
// Test immédiat de la connexion et initialisation des tables
db.getConnection()
  .then(async connection => {
    console.log("✅ Connexion à la base de données réussie !");
    
    try {
      // 1. Table users
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          nom VARCHAR(100) NOT NULL,
          prenom VARCHAR(100) NOT NULL,
          telephone VARCHAR(20),
          xp INT DEFAULT 0,
          points INT DEFAULT 0,
          niveau INT DEFAULT 1,
          parrain_id INT,
          code_parrainage VARCHAR(50) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("👉 Table 'users' vérifiée / créée.");

      // 2. Table user_stats
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_stats (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          date DATE NOT NULL,
          poids DECIMAL(5,2),
          force_pompes INT,
          endurance_gainage INT,
          souplesse INT,
          cardio_vo2 INT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log("👉 Table 'user_stats' vérifiée / créée.");

      // 3. Table badges
      await connection.query(`
        CREATE TABLE IF NOT EXISTS badges (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          description VARCHAR(255) NOT NULL,
          icone VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          seuil INT NOT NULL
        )
      `);
      console.log("👉 Table 'badges' vérifiée / créée.");

      // 4. Table user_badges
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_badges (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          badge_id INT NOT NULL,
          date_obtention TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_badge (user_id, badge_id)
        )
      `);
      console.log("👉 Table 'user_badges' vérifiée / créée.");

      // 5. Table rewards
      await connection.query(`
        CREATE TABLE IF NOT EXISTS rewards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          description VARCHAR(255) NOT NULL,
          cout_points INT NOT NULL,
          stock INT DEFAULT -1
        )
      `);
      console.log("👉 Table 'rewards' vérifiée / créée.");

      // 6. Table user_rewards
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_rewards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          reward_id INT NOT NULL,
          date_echange TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          statut VARCHAR(50) DEFAULT 'demande',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
        )
      `);
      console.log("👉 Table 'user_rewards' vérifiée / créée.");

      // 7. Modification de la table reservations existante
      const [columns] = await connection.query("SHOW COLUMNS FROM reservations LIKE 'user_id'");
      if (columns.length === 0) {
        console.log("🔄 Ajout de la colonne user_id dans la table reservations...");
        await connection.query("ALTER TABLE reservations ADD COLUMN user_id INT");
        await connection.query("ALTER TABLE reservations ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
        console.log("👉 Colonne user_id ajoutée avec succès !");
      }

      const [xpColumns] = await connection.query("SHOW COLUMNS FROM reservations LIKE 'xp_awarded'");
      if (xpColumns.length === 0) {
        console.log("🔄 Ajout de la colonne xp_awarded dans la table reservations...");
        await connection.query("ALTER TABLE reservations ADD COLUMN xp_awarded BOOLEAN DEFAULT FALSE");
        console.log("👉 Colonne xp_awarded ajoutée avec succès !");
      }

      // Colonnes additionnelles pour la gamification
      const [colProfilComplete] = await connection.query("SHOW COLUMNS FROM users LIKE 'profil_complete'");
      if (colProfilComplete.length === 0) {
        await connection.query("ALTER TABLE users ADD COLUMN profil_complete BOOLEAN DEFAULT FALSE");
        console.log("👉 Colonne 'profil_complete' ajoutée à la table 'users'.");
      }

      const [colObjectifsVisites] = await connection.query("SHOW COLUMNS FROM users LIKE 'objectifs_visites'");
      if (colObjectifsVisites.length === 0) {
        await connection.query("ALTER TABLE users ADD COLUMN objectifs_visites BOOLEAN DEFAULT FALSE");
        console.log("👉 Colonne 'objectifs_visites' ajoutée à la table 'users'.");
      }

      const [colAvisLaisse] = await connection.query("SHOW COLUMNS FROM reservations LIKE 'avis_laisse'");
      if (colAvisLaisse.length === 0) {
        await connection.query("ALTER TABLE reservations ADD COLUMN avis_laisse BOOLEAN DEFAULT FALSE");
        console.log("👉 Colonne 'avis_laisse' ajoutée à la table 'reservations'.");
      }

      // S'assurer que le T-Shirt CombatFit vaut au moins 500 points en BDD
      await connection.query("UPDATE rewards SET cout_points = 500 WHERE nom = 'T-Shirt CombatFit' AND cout_points < 500");
      // Ajuster le coût de la séance offerte à 800 trophées et du shaker à 200 trophées
      await connection.query("UPDATE rewards SET cout_points = 800 WHERE nom = 'Séance offerte'");
      await connection.query("UPDATE rewards SET cout_points = 200 WHERE nom = 'Shaker CombatFit'");

      // 8. Insertion des badges par défaut s'il n'y en a aucun
      const [badgesCount] = await connection.query("SELECT COUNT(*) as count FROM badges");
      if (badgesCount[0].count === 0) {
        console.log("🌱 Insertion des badges par défaut...");
        const defaultBadges = [
          ['Premier Pas', 'Participer à sa première séance', 'fitness_center', 'seances', 1],
          ['Habitué', 'Participer à 10 séances', 'stars', 'seances', 10],
          ['Élite', 'Participer à 30 séances', 'military_tech', 'seances', 30],
          ['Parrain en Or', 'Parrainer son premier ami', 'diversity_1', 'parrainage', 1],
          ['Machine de guerre', 'Faire 50 pompes d\'affilée', 'bolt', 'perf_pompes', 50],
          ['Force tranquille', 'Tenir 3 minutes (180s) de gainage', 'timer', 'perf_gainage', 180]
        ];
        for (const b of defaultBadges) {
          await connection.query("INSERT INTO badges (nom, description, icone, type, seuil) VALUES (?, ?, ?, ?, ?)", b);
        }
      }

      // 9. Insertion des récompenses par défaut s'il n'y en a aucune
      const [rewardsCount] = await connection.query("SELECT COUNT(*) as count FROM rewards");
      if (rewardsCount[0].count === 0) {
        console.log("🌱 Insertion des récompenses par défaut...");
        const defaultRewards = [
          ['Séance offerte', '1 séance de coaching de 90 min offerte', 800, -1],
          ['T-Shirt CombatFit', 'Le t-shirt officiel pour vos entraînements', 500, 50],
          ['Shaker CombatFit', 'Le shaker pour vos boissons de récupération', 200, 100]
        ];
        for (const r of defaultRewards) {
          await connection.query("INSERT INTO rewards (nom, description, cout_points, stock) VALUES (?, ?, ?, ?)", r);
        }
      }

      console.log("🚀 Base de données CombatFit initialisée avec succès !");
    } catch (dbErr) {
      console.error("❌ ERREUR lors de l'initialisation de la BDD :", dbErr.message);
      console.error(dbErr);
    } finally {
      connection.release();
    }
  })
  .catch(err => {
    console.error("❌ ERREUR DE CONNEXION BDD :", err.message);
    console.error("Détails de l'erreur :", err);
  });

module.exports = db;
