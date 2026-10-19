-- Demo data for local runs (SEED_DATABASE=true). Idempotent: only seeds an empty database.
INSERT INTO "timeDeposits" (id, "planType", days, balance)
SELECT * FROM (VALUES
    (1, 'basic',   45,  1234567.00),
    (2, 'student', 120, 10000.00),
    (3, 'student', 400, 10000.00),
    (4, 'premium', 40,  50000.00),
    (5, 'premium', 90,  50000.00),
    (6, 'basic',   10,  2500.00)
) AS seed (id, "planType", days, balance)
WHERE NOT EXISTS (SELECT 1 FROM "timeDeposits");

INSERT INTO withdrawals ("timeDepositId", amount, date)
SELECT * FROM (VALUES
    (1, 1000.00, DATE '2026-01-15'),
    (1, 250.50,  DATE '2026-03-02'),
    (5, 5000.00, DATE '2026-02-20')
) AS seed ("timeDepositId", amount, date)
WHERE NOT EXISTS (SELECT 1 FROM withdrawals);

SELECT setval(pg_get_serial_sequence('"timeDeposits"', 'id'), (SELECT max(id) FROM "timeDeposits"));
