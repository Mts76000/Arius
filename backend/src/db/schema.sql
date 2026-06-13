-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  prenom VARCHAR(100),
  nom VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
-- Create entreprises table
CREATE TABLE IF NOT EXISTS entreprises (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  nom VARCHAR(255) NOT NULL,
  statut ENUM('client','prospect','fournisseur','a_reactiver') NOT NULL,
  rue VARCHAR(255),
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  pays VARCHAR(100),
  description TEXT,
  logo VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_statut_nom(user_id, statut, nom),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  entreprise_id CHAR(36) NOT NULL,
  prenom VARCHAR(100),
  nom VARCHAR(100) NOT NULL,
  poste VARCHAR(150),
  email VARCHAR(255),
  tel_direct VARCHAR(50),
  tel_mobile VARCHAR(50),
  contact_principal BOOLEAN DEFAULT FALSE,
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_entreprise(user_id, entreprise_id, contact_principal),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create objectifs_mensuels table
CREATE TABLE IF NOT EXISTS objectifs_mensuels (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  annee INT NOT NULL,
  mois INT NOT NULL,
  objectif_ht DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_user_mois_annee (user_id, annee, mois),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ca_mensuel table
CREATE TABLE IF NOT EXISTS ca_mensuel (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  entreprise_id VARCHAR(36) NOT NULL,
  annee INT NOT NULL,
  mois INT NOT NULL,
  ca_ht DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_user_entreprise_mois_annee (user_id, entreprise_id, annee, mois),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
