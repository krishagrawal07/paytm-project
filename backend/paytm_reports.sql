USE paytm_db;

-- q1
SELECT u.user_id, u.first_name, u.last_name
FROM users u
JOIN transactions t ON u.user_id = t.user_id
GROUP BY u.user_id, u.first_name, u.last_name
HAVING COUNT(t.transaction_id) > 10
ORDER BY u.user_id;

-- q2
SELECT DISTINCT t.user_id
FROM transactions t
JOIN payments p ON t.transaction_id = p.transaction_id;

-- q3
SELECT DISTINCT t.*
FROM transactions t
JOIN merchants m ON t.merchant_id = m.merchant_id
WHERE m.merchant_name = 'Amazon'
  AND YEAR(t.transaction_date) = 2023;

-- q4
SELECT u.email, t.transaction_id
FROM users u
JOIN transactions t ON u.user_id = t.user_id
ORDER BY t.transaction_id;

-- q5
SELECT DISTINCT m.merchant_id, m.merchant_name
FROM merchants m
LEFT JOIN transactions t ON m.merchant_id = t.merchant_id
WHERE t.transaction_id IS NULL;

-- q6
SELECT DISTINCT u.user_id, u.first_name, u.last_name
FROM users u
JOIN transactions t ON u.user_id = t.user_id
JOIN merchants m ON t.merchant_id = m.merchant_id
JOIN payments p ON t.transaction_id = p.transaction_id
WHERE m.merchant_name = 'Zomato'
ORDER BY u.last_name, u.first_name;

-- q7
SELECT DISTINCT m.merchant_id, u.first_name, u.last_name
FROM users u
JOIN transactions t ON u.user_id = t.user_id
JOIN merchants m ON t.merchant_id = m.merchant_id
WHERE m.category = 'E-commerce'
  AND t.transaction_status = 'Completed'
ORDER BY u.last_name, u.first_name;

-- q8
SELECT merchant_id, AVG(amount) AS avg_transaction
FROM transactions
GROUP BY merchant_id
HAVING AVG(amount) = (
    SELECT MAX(avg_amt)
    FROM (
        SELECT AVG(amount) AS avg_amt
        FROM transactions
        GROUP BY merchant_id
    ) AS temp
);

-- q9
SELECT t.user_id AS customer_id, COUNT(p.payment_id) AS payment_count
FROM transactions t
JOIN payments p ON t.transaction_id = p.transaction_id
GROUP BY t.user_id
HAVING COUNT(p.payment_id) > 5;

-- q10
SELECT merchant_id, SUM(amount * 0.02) AS total_commission
FROM transactions
GROUP BY merchant_id;

SHOW TABLES;
SELECT * FROM users;
SELECT * FROM merchants;
SELECT * FROM transactions;
SELECT * FROM payments;
