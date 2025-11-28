-- Database schema for DataLouna test task
-- Tables: users, products, purchases

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_paid DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Sample data
-- Users
INSERT INTO users (username, balance) VALUES
    ('alice', 1000.50),
    ('bob', 750.25),
    ('charlie', 500.00)
ON CONFLICT (username) DO NOTHING;

-- Products (with fractional prices as required)
INSERT INTO products (name, price) VALUES
    ('AK-47 | Redline', 25.99),
    ('AWP | Dragon Lore', 999.99),
    ('M4A4 | Howl', 150.50),
    ('Glock-18 | Fade', 45.75),
    ('Karambit | Fade', 850.25),
    ('AWP | Asiimov', 35.49),
    ('M4A1-S | Icarus Fell', 28.33),
    ('USP-S | Kill Confirmed', 12.67),
    ('Desert Eagle | Blaze', 18.88),
    ('AK-47 | Fire Serpent', 120.15)
ON CONFLICT (name) DO NOTHING;

