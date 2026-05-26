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
    rejectUnauthorized: true
  }
};
console.log("Tentative de connexion à la base de données...");

const db = mysql.createPool(dbConfig);

// Test immédiat de la connexion
db.getConnection()
  .then(connection => {
    console.log("✅ Connexion à la base de données réussie !");
    connection.release();
  })
  .catch(err => {
    console.error("❌ ERREUR DE CONNEXION BDD :", err.message);
    console.error("Détails de l'erreur :", err);
  });

module.exports = db;
