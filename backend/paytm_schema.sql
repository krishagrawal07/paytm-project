CREATE DATABASE IF NOT EXISTS paytm_db;
USE paytm_db;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100)
);

CREATE TABLE merchants (
  merchant_id INT PRIMARY KEY AUTO_INCREMENT,
  merchant_name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(255)
);

CREATE TABLE accounts (
  account_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  account_number VARCHAR(50) NOT NULL UNIQUE,
  account_type VARCHAR(50) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  merchant_id INT NOT NULL,
  account_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type VARCHAR(50),
  transaction_status VARCHAR(50) NOT NULL,
  transaction_date DATE NOT NULL,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts(account_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL,
  CONSTRAINT fk_payments_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);
