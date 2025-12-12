-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Inventory table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  stock_qty INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  location VARCHAR(100), -- optional warehouse/location
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE inventory_transactions (
  id SERIAL PRIMARY KEY,
  inventory_id INT REFERENCES inventory(id) ON DELETE CASCADE,
  change_qty INT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'RECEIVED', 'DEDUCTED', 'ADJUSTMENT'
  related_id INT, -- could reference requisition or PO ID
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE requisitions ADD COLUMN product_id INT REFERENCES products(id);
ALTER TABLE purchase_orders ADD COLUMN product_id INT REFERENCES products(id);