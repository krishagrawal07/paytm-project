-- Paytm Case Study Database Setup Script
-- Create Database
CREATE DATABASE IF NOT EXISTS paytm_db;
USE paytm_db;

-- 1. Users Table (3NF)
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    address TEXT
);

-- 2. Merchants Table (3NF)
CREATE TABLE IF NOT EXISTS Merchants (
    merchant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    registered_date DATE
);

-- 3. Accounts Table
CREATE TABLE IF NOT EXISTS Accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 4. Transactions Table (3NF)
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    merchant_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date DATETIME NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Completed',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES Merchants(merchant_id) ON DELETE CASCADE
);

-- 5. Payments Table (3NF)
CREATE TABLE IF NOT EXISTS Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT UNIQUE,
    gateway_name VARCHAR(50),
    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id) ON DELETE CASCADE
);

-- =========================================================================
-- INSERT MOCK DATA TO TEST QUERIES
-- =========================================================================

-- Insert Users
INSERT INTO Users (first_name, last_name, email, phone, address) VALUES
('John', 'Doe', 'john.doe@example.com', '1234567890', '123 Main St'),
('Alice', 'Smith', 'alice.smith@example.com', '0987654321', '456 Elm St'),
('Bob', 'Johnson', 'bob.j@example.com', '5551234567', '789 Oak Ave'),
('Charlie', 'Brown', 'charlie.b@example.com', '5559876543', '321 Pine Dr'),
('Diana', 'Prince', 'diana.p@example.com', '5555555555', 'Themyscira');

-- Insert Merchants
INSERT INTO Merchants (name, category, registered_date) VALUES
('Amazon', 'E-commerce', '2020-01-15'),
('Zomato', 'Food Delivery', '2021-03-22'),
('Flipkart', 'E-commerce', '2019-11-10'),
('Local Bakery', 'Food & Beverage', '2023-01-05'),
('Tech World', 'Electronics', '2023-08-11'),
('Ghost Store', 'Misc', '2024-01-01'); -- Merchant with NO transactions (Query 5)

-- Insert Transactions
-- User 1 (John): Has 11 transactions to satisfy "more than 10" (Query 1)
INSERT INTO Transactions (user_id, merchant_id, amount, transaction_date, status) VALUES
(1, 1, 1500.00, '2023-05-15 10:00:00', 'Completed'), -- Amazon in 2023 (Query 3)
(1, 1, 200.00, '2023-06-20 11:30:00', 'Completed'),  -- Amazon in 2023
(1, 2, 350.00, '2023-07-10 19:45:00', 'Completed'),  -- Zomato
(1, 3, 400.00, '2024-01-10 14:00:00', 'Completed'),  -- E-commerce
(1, 4, 50.00, '2024-02-14 09:15:00', 'Completed'),
(1, 1, 120.00, '2024-02-15 10:20:00', 'Completed'),
(1, 2, 700.00, '2024-02-18 20:00:00', 'Completed'),
(1, 4, 30.00, '2024-02-20 08:00:00', 'Completed'),
(1, 5, 2000.00, '2024-02-22 15:30:00', 'Completed'),
(1, 3, 150.00, '2024-02-25 16:45:00', 'Completed'),
(1, 2, 450.00, '2024-03-01 19:00:00', 'Completed');

-- User 2 (Alice): Has 6 transactions to satisfy "> 5 payments" (Query 9)
INSERT INTO Transactions (user_id, merchant_id, amount, transaction_date, status) VALUES
(2, 2, 600.00, '2024-01-05 18:30:00', 'Completed'), -- Zomato (Query 6)
(2, 1, 1000.00, '2024-01-15 12:00:00', 'Completed'), 
(2, 3, 800.00, '2024-02-05 14:20:00', 'Completed'), -- E-commerce (Query 7)
(2, 5, 3000.00, '2024-02-10 10:10:00', 'Completed'),
(2, 4, 45.00, '2024-02-28 09:40:00', 'Completed'),
(2, 2, 350.00, '2024-03-05 20:15:00', 'Completed');

-- User 3 (Bob): Payments to Zomato & Amazon
INSERT INTO Transactions (user_id, merchant_id, amount, transaction_date, status) VALUES
(3, 2, 850.00, '2024-01-20 21:00:00', 'Completed'), -- Zomato (Query 6)
(3, 1, 1200.00, '2023-11-11 10:00:00', 'Completed'); -- Amazon 2023 (Query 3)

-- Tech World merchant needs high avg transaction value to test Query 8.
-- Currently: User 1 -> 2000, User 2 -> 3000. Avg = 2500.

-- Insert Payments (Simulating successful payments)
-- Let's put payments for all logic so that 'Query 2' works accurately
INSERT INTO Payments (transaction_id, gateway_name) VALUES
(1, 'Paytm Wallet'), (2, 'UPI'), (3, 'Credit Card'), (4, 'UPI'), (5, 'Paytm Wallet'),
(6, 'UPI'), (7, 'Credit Card'), (8, 'Paytm Wallet'), (9, 'Net Banking'), (10, 'UPI'),
(11, 'Paytm Wallet'), (12, 'UPI'), (13, 'Credit Card'), (14, 'Net Banking'), (15, 'UPI'),
(16, 'Paytm Wallet'), (17, 'UPI'), (18, 'Credit Card'), (19, 'UPI');
