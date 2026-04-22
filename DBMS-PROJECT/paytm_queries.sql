-- Paytm Case Study Requirements - 10 Queries

-- 1. List each user's ID and name who has made more than 10 transactions. (Ordered by UserID)
SELECT 
    U.user_id, 
    CONCAT(U.first_name, ' ', U.last_name) AS full_name
FROM Users U
JOIN Transactions T ON U.user_id = T.user_id
GROUP BY U.user_id, U.first_name, U.last_name
HAVING COUNT(T.transaction_id) > 10
ORDER BY U.user_id;

-- 2. Provide the IDs of all users who have made at least one payment. Please refrain from duplicating.
SELECT DISTINCT U.user_id
FROM Users U
JOIN Transactions T ON U.user_id = T.user_id
JOIN Payments P ON T.transaction_id = P.transaction_id;

-- 3. List all transactions that occurred for the merchant "Amazon" in 2023. Please refrain from duplications.
SELECT DISTINCT T.*
FROM Transactions T
JOIN Merchants M ON T.merchant_id = M.merchant_id
WHERE M.name = 'Amazon' AND YEAR(T.transaction_date) = 2023;

-- 4. Provide each user's email address and their transaction ID. Please arrange them according to TransactionID.
SELECT 
    U.email, 
    T.transaction_id
FROM Users U
JOIN Transactions T ON U.user_id = T.user_id
ORDER BY T.transaction_id ASC;

-- 5. Locate all merchants who have registered but have no transactions yet. Please refrain from duplications.
SELECT DISTINCT M.merchant_id, M.name
FROM Merchants M
LEFT JOIN Transactions T ON M.merchant_id = T.merchant_id
WHERE T.transaction_id IS NULL;

-- 6. Give the names and IDs of all users who made payments to "Zomato." The names should be listed in alphabetical order (by last name).
SELECT 
    U.user_id, 
    CONCAT(U.first_name, ' ', U.last_name) AS full_name
FROM Users U
JOIN Transactions T ON U.user_id = T.user_id
JOIN Merchants M ON T.merchant_id = M.merchant_id
WHERE M.name = 'Zomato'
GROUP BY U.user_id, U.first_name, U.last_name
ORDER BY U.last_name ASC;

-- 7. Give the merchant IDs and the names of all users who completed transactions with merchants in the "E-commerce" category. (Alphabetical order)
SELECT 
    M.merchant_id, 
    CONCAT(U.first_name, ' ', U.last_name) AS full_name
FROM Users U
JOIN Transactions T ON U.user_id = T.user_id
JOIN Merchants M ON T.merchant_id = M.merchant_id
WHERE M.category = 'E-commerce'
GROUP BY M.merchant_id, U.first_name, U.last_name
ORDER BY full_name ASC;

-- 8. Find the merchant ID and the average transaction amount for merchants that have the highest average transaction value. Name columns merchant_id and avg_transaction.
SELECT 
    merchant_id, 
    AVG(amount) AS avg_transaction
FROM Transactions
GROUP BY merchant_id
ORDER BY avg_transaction DESC
LIMIT 1;

-- 9. Find users who have made more than 5 payments. List the user ID as customer_id and the count of payments as payment_count.
SELECT 
    U.user_id AS customer_id, 
    COUNT(P.payment_id) AS payment_count
FROM Users U
JOIN Transactions T ON U.user_id = T.user_id
JOIN Payments P ON T.transaction_id = P.transaction_id
GROUP BY U.user_id
HAVING COUNT(P.payment_id) > 5;

-- 10. Assuming a flat fee of 2% per transaction, give the merchant ID and the total commission earned from transactions for each merchant. Name the merchant ID as merchant_id, and the commission as total_commission.
SELECT 
    merchant_id, 
    SUM(amount * 0.02) AS total_commission
FROM Transactions
GROUP BY merchant_id;
