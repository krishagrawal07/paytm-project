USE paytm_db;

INSERT INTO users (user_id, first_name, last_name, email, phone, address, city, state, country) VALUES
(1, 'Aarav', 'Sharma', 'aarav.sharma@example.com', '9876500001', '12 MG Road', 'Bengaluru', 'Karnataka', 'India'),
(2, 'Diya', 'Mehta', 'diya.mehta@example.com', '9876500002', '45 Park Street', 'Kolkata', 'West Bengal', 'India'),
(3, 'Rohan', 'Singh', 'rohan.singh@example.com', '9876500003', '88 Civil Lines', 'Lucknow', 'Uttar Pradesh', 'India'),
(4, 'Ananya', 'Gupta', 'ananya.gupta@example.com', '9876500004', '5 Lake View', 'Pune', 'Maharashtra', 'India'),
(5, 'Kabir', 'Verma', 'kabir.verma@example.com', '9876500005', '31 Green Park', 'Delhi', 'Delhi', 'India'),
(6, 'Isha', 'Nair', 'isha.nair@example.com', '9876500006', '9 Marine Drive', 'Mumbai', 'Maharashtra', 'India');

INSERT INTO merchants (merchant_id, merchant_name, category, email, phone, address) VALUES
(1, 'Amazon', 'E-commerce', 'support@amazon.in', '180030001', 'Amazon India HQ'),
(2, 'Zomato', 'Food Delivery', 'help@zomato.com', '180030002', 'Zomato HQ'),
(3, 'Flipkart', 'E-commerce', 'care@flipkart.com', '180030003', 'Flipkart Campus'),
(4, 'Swiggy', 'Food Delivery', 'help@swiggy.in', '180030004', 'Swiggy Office'),
(5, 'LocalMart', 'Retail', 'contact@localmart.com', '180030005', 'LocalMart Center'),
(6, 'NoTxn Merchant', 'Services', 'hello@notxn.com', '180030006', 'NoTxn Address');

INSERT INTO accounts (account_id, user_id, account_number, account_type, balance, created_at) VALUES
(1, 1, 'ACCT1001', 'Savings', 12000.00, '2023-01-10 10:00:00'),
(2, 2, 'ACCT1002', 'Savings', 8500.00, '2023-02-11 11:30:00'),
(3, 3, 'ACCT1003', 'Current', 23000.00, '2023-03-15 14:20:00'),
(4, 4, 'ACCT1004', 'Savings', 5100.00, '2023-04-18 09:10:00'),
(5, 5, 'ACCT1005', 'Current', 41000.00, '2023-05-20 13:05:00'),
(6, 6, 'ACCT1006', 'Savings', 6400.00, '2023-06-25 16:40:00');

INSERT INTO transactions (transaction_id, user_id, merchant_id, account_id, amount, transaction_type, transaction_status, transaction_date) VALUES
(1, 1, 1, 1, 500.00, 'Purchase', 'Completed', '2023-01-15'),
(2, 1, 1, 1, 1200.00, 'Purchase', 'Completed', '2023-02-20'),
(3, 1, 2, 1, 350.00, 'Food', 'Completed', '2023-03-05'),
(4, 1, 3, 1, 2400.00, 'Purchase', 'Completed', '2023-04-09'),
(5, 1, 1, 1, 180.00, 'Purchase', 'Completed', '2023-05-01'),
(6, 1, 4, 1, 220.00, 'Food', 'Completed', '2023-06-11'),
(7, 1, 3, 1, 3300.00, 'Purchase', 'Completed', '2023-07-19'),
(8, 1, 1, 1, 750.00, 'Purchase', 'Pending', '2023-08-23'),
(9, 1, 2, 1, 410.00, 'Food', 'Completed', '2023-09-14'),
(10, 1, 3, 1, 2900.00, 'Purchase', 'Completed', '2023-10-02'),
(11, 1, 1, 1, 1300.00, 'Purchase', 'Completed', '2023-11-22'),
(12, 2, 1, 2, 900.00, 'Purchase', 'Completed', '2023-12-12'),
(13, 2, 2, 2, 280.00, 'Food', 'Completed', '2024-01-03'),
(14, 2, 3, 2, 4500.00, 'Purchase', 'Completed', '2025-01-09'),
(15, 3, 3, 3, 5200.00, 'Purchase', 'Completed', '2024-02-18'),
(16, 3, 4, 3, 150.00, 'Food', 'Failed', '2024-03-22'),
(17, 4, 5, 4, 300.00, 'Purchase', 'Completed', '2024-04-10'),
(18, 5, 1, 5, 700.00, 'Purchase', 'Pending', '2025-05-14');

INSERT INTO payments (payment_id, transaction_id, payment_method, payment_status, payment_date) VALUES
(1, 1, 'UPI', 'Success', '2023-01-15'),
(2, 2, 'Card', 'Success', '2023-02-20'),
(3, 3, 'Wallet', 'Success', '2023-03-05'),
(4, 4, 'UPI', 'Success', '2023-04-09'),
(5, 5, 'NetBanking', 'Success', '2023-05-01'),
(6, 6, 'UPI', 'Success', '2023-06-11'),
(7, 7, 'Card', 'Success', '2023-07-19'),
(8, 12, 'UPI', 'Success', '2023-12-12'),
(9, 13, 'Wallet', 'Success', '2024-01-03'),
(10, 15, 'Card', 'Success', '2024-02-18'),
(11, 17, 'UPI', 'Success', '2024-04-10');
