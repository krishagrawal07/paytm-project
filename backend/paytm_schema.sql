CREATE DATABASE IF NOT EXISTS paytm_db;
USE paytm_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(150),
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50)
);

CREATE TABLE merchants (
    merchant_id INT PRIMARY KEY AUTO_INCREMENT,
    merchant_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address VARCHAR(150)
);

CREATE TABLE accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_number VARCHAR(30) UNIQUE NOT NULL,
    account_type VARCHAR(30),
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    merchant_id INT NOT NULL,
    account_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type VARCHAR(30),
    transaction_status VARCHAR(20),
    transaction_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    payment_method VARCHAR(30),
    payment_status VARCHAR(20),
    payment_date DATE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
);
