USE paytm_db;

INSERT INTO users (first_name, last_name, email, phone, address, city, state, country) VALUES
('Amit', 'Sharma', 'amit@gmail.com', '9876543210', 'Street 1', 'Delhi', 'Delhi', 'India'),
('Priya', 'Verma', 'priya@gmail.com', '9876543211', 'Street 2', 'Mumbai', 'Maharashtra', 'India'),
('Rahul', 'Singh', 'rahul@gmail.com', '9876543212', 'Street 3', 'Lucknow', 'UP', 'India'),
('Neha', 'Gupta', 'neha@gmail.com', '9876543213', 'Street 4', 'Jaipur', 'Rajasthan', 'India'),
('Karan', 'Mehta', 'karan@gmail.com', '9876543214', 'Street 5', 'Pune', 'Maharashtra', 'India'),
('Sneha', 'Patel', 'sneha@gmail.com', '9876543215', 'Street 6', 'Ahmedabad', 'Gujarat', 'India'),
('Rohit', 'Yadav', 'rohit@gmail.com', '9876543216', 'Street 7', 'Kanpur', 'UP', 'India'),
('Anjali', 'Kapoor', 'anjali@gmail.com', '9876543217', 'Street 8', 'Chandigarh', 'Punjab', 'India'),
('Vikas', 'Mishra', 'vikas@gmail.com', '9876543218', 'Street 9', 'Bhopal', 'MP', 'India'),
('Pooja', 'Nair', 'pooja@gmail.com', '9876543219', 'Street 10', 'Kochi', 'Kerala', 'India');

INSERT INTO merchants (merchant_name, category, email, phone, address) VALUES
('Amazon', 'E-commerce', 'amazon@merchant.com', '9000000001', 'Bangalore'),
('Zomato', 'Food', 'zomato@merchant.com', '9000000002', 'Gurgaon'),
('Flipkart', 'E-commerce', 'flipkart@merchant.com', '9000000003', 'Bangalore'),
('Swiggy', 'Food', 'swiggy@merchant.com', '9000000004', 'Bangalore'),
('Myntra', 'E-commerce', 'myntra@merchant.com', '9000000005', 'Bangalore'),
('Uber', 'Transport', 'uber@merchant.com', '9000000006', 'Mumbai'),
('BookMyShow', 'Entertainment', 'bms@merchant.com', '9000000007', 'Mumbai'),
('PayElectric', 'Utilities', 'electric@merchant.com', '9000000008', 'Delhi'),
('NoTxnMart', 'Retail', 'notxn@merchant.com', '9000000009', 'Chennai');

INSERT INTO accounts (user_id, account_number, account_type, balance, created_at) VALUES
(1, 'ACC1001', 'Savings', 50000.00, '2023-01-01'),
(2, 'ACC1002', 'Savings', 40000.00, '2023-01-02'),
(3, 'ACC1003', 'Current', 30000.00, '2023-01-03'),
(4, 'ACC1004', 'Savings', 35000.00, '2023-01-04'),
(5, 'ACC1005', 'Current', 60000.00, '2023-01-05'),
(6, 'ACC1006', 'Savings', 25000.00, '2023-01-06'),
(7, 'ACC1007', 'Savings', 45000.00, '2023-01-07'),
(8, 'ACC1008', 'Current', 70000.00, '2023-01-08'),
(9, 'ACC1009', 'Savings', 20000.00, '2023-01-09'),
(10, 'ACC1010', 'Savings', 55000.00, '2023-01-10');

INSERT INTO transactions (user_id, merchant_id, account_id, amount, transaction_type, transaction_status, transaction_date) VALUES
(1, 1, 1, 1200.00, 'Payment', 'Completed', '2023-01-15'),
(1, 2, 1, 500.00, 'Payment', 'Completed', '2023-02-10'),
(1, 1, 1, 2500.00, 'Payment', 'Completed', '2023-03-05'),
(1, 3, 1, 1800.00, 'Payment', 'Completed', '2023-04-12'),
(1, 1, 1, 2200.00, 'Payment', 'Completed', '2023-05-20'),
(1, 5, 1, 1600.00, 'Payment', 'Completed', '2023-06-11'),
(1, 2, 1, 750.00, 'Payment', 'Completed', '2023-07-09'),
(1, 6, 1, 320.00, 'Payment', 'Completed', '2023-08-15'),
(1, 1, 1, 4100.00, 'Payment', 'Completed', '2023-09-25'),
(1, 3, 1, 980.00, 'Payment', 'Completed', '2023-10-18'),
(1, 7, 1, 650.00, 'Payment', 'Completed', '2023-11-12'),
(1, 8, 1, 1200.00, 'Payment', 'Completed', '2023-12-01'),

(2, 2, 2, 430.00, 'Payment', 'Completed', '2023-01-21'),
(2, 1, 2, 2100.00, 'Payment', 'Completed', '2023-03-18'),
(2, 4, 2, 600.00, 'Payment', 'Completed', '2023-04-20'),

(3, 1, 3, 3200.00, 'Payment', 'Completed', '2023-02-14'),
(3, 5, 3, 1500.00, 'Payment', 'Completed', '2023-05-25'),
(3, 2, 3, 700.00, 'Payment', 'Completed', '2023-08-30'),

(4, 6, 4, 450.00, 'Payment', 'Completed', '2023-06-10'),
(4, 7, 4, 900.00, 'Payment', 'Failed', '2023-07-11'),

(5, 1, 5, 5000.00, 'Payment', 'Completed', '2023-09-17'),
(5, 3, 5, 2800.00, 'Payment', 'Completed', '2023-10-05'),
(5, 2, 5, 650.00, 'Payment', 'Completed', '2023-10-21'),

(6, 8, 6, 1100.00, 'Payment', 'Completed', '2023-03-09'),
(6, 2, 6, 300.00, 'Payment', 'Completed', '2023-04-19'),

(7, 4, 7, 550.00, 'Payment', 'Completed', '2023-11-23'),
(8, 1, 8, 7200.00, 'Payment', 'Completed', '2023-12-14'),
(9, 5, 9, 1300.00, 'Payment', 'Pending', '2023-12-20'),
(10, 2, 10, 480.00, 'Payment', 'Completed', '2023-12-24');

INSERT INTO payments (transaction_id, payment_method, payment_status, payment_date) VALUES
(1, 'UPI', 'Success', '2023-01-15'),
(2, 'Wallet', 'Success', '2023-02-10'),
(3, 'Card', 'Success', '2023-03-05'),
(4, 'UPI', 'Success', '2023-04-12'),
(5, 'NetBanking', 'Success', '2023-05-20'),
(6, 'Wallet', 'Success', '2023-06-11'),
(7, 'UPI', 'Success', '2023-07-09'),
(8, 'Card', 'Success', '2023-08-15'),
(9, 'UPI', 'Success', '2023-09-25'),
(10, 'Wallet', 'Success', '2023-10-18'),
(11, 'UPI', 'Success', '2023-11-12'),
(12, 'NetBanking', 'Success', '2023-12-01'),
(13, 'Wallet', 'Success', '2023-01-21'),
(14, 'UPI', 'Success', '2023-03-18'),
(15, 'Card', 'Success', '2023-04-20'),
(16, 'UPI', 'Success', '2023-02-14'),
(17, 'Wallet', 'Success', '2023-05-25'),
(18, 'UPI', 'Success', '2023-08-30'),
(19, 'NetBanking', 'Success', '2023-06-10'),
(20, 'Card', 'Failed', '2023-07-11'),
(21, 'UPI', 'Success', '2023-09-17'),
(22, 'Wallet', 'Success', '2023-10-05'),
(23, 'UPI', 'Success', '2023-10-21'),
(24, 'NetBanking', 'Success', '2023-03-09'),
(25, 'Wallet', 'Success', '2023-04-19'),
(26, 'UPI', 'Success', '2023-11-23'),
(27, 'Card', 'Success', '2023-12-14'),
(28, 'Wallet', 'Pending', '2023-12-20'),
(29, 'UPI', 'Success', '2023-12-24');
