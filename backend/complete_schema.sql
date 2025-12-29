-- MochKris Inventory System - Complete Database Schema
-- This file combines all database tables and initial data

-- Users table (merged from database.sql and init-db.sql)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),  -- Alternative hashed password
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table (from database.sql)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table (from purchase_order_schema.sql and init-db.sql)
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders table (merged from purchase_order_schema.sql and init-db.sql)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INTEGER REFERENCES suppliers(id),
  owner_id INTEGER REFERENCES users(id) NOT NULL,
  manager_id INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'purchased', 'received', 'completed')),
  expected_delivery_date DATE,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  product_id INTEGER REFERENCES products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PO Items table (from purchase_order_schema.sql and init-db.sql)
CREATE TABLE IF NOT EXISTS po_items (
  id SERIAL PRIMARY KEY,
  po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_name VARCHAR(100) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table (from database.sql)
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  stock_qty INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  location VARCHAR(100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Transactions table (from database.sql)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  inventory_id INT REFERENCES inventory(id) ON DELETE CASCADE,
  change_qty INT NOT NULL,
  type VARCHAR(50) NOT NULL,  -- 'RECEIVED', 'DEDUCTED', 'ADJUSTMENT'
  related_id INT,  -- could reference requisition or PO ID
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Requisitions table (referenced in ALTER TABLE)
CREATE TABLE IF NOT EXISTS requisitions (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  status VARCHAR(20) DEFAULT 'pending',
  quantity INT NOT NULL,
  requester_id INT REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
-- Insert sample users
INSERT INTO users (username, name, email, password, role) 
VALUES 
  ('admin', 'Admin User', 'admin@mochkris.com', 'hashed_password_here', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, name, email, password, role)
VALUES 
  ('manager1', 'Manager One', 'manager1@mochkris.com', 'hashed_password_here', 'manager')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, name, email, password, role)
VALUES 
  ('staff1', 'Staff Member', 'staff1@mochkris.com', 'hashed_password_here', 'staff')
ON CONFLICT (username) DO NOTHING;

-- Insert sample supplier
INSERT INTO suppliers (name, contact_person, email, phone, address)
VALUES 
  ('ABC Supplies', 'John Doe', 'john@abcsupplies.com', '1234567890', '123 Supplier St, City')
ON CONFLICT (email) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic timestamp updates
DO $$
BEGIN
    -- Only create trigger if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_users_modtime'
    ) THEN
        CREATE TRIGGER update_users_modtime
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_suppliers_modtime'
    ) THEN
        CREATE TRIGGER update_suppliers_modtime
        BEFORE UPDATE ON suppliers
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_purchase_orders_modtime'
    ) THEN
        CREATE TRIGGER update_purchase_orders_modtime
        BEFORE UPDATE ON purchase_orders
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_requisitions_modtime'
    ) THEN
        CREATE TRIGGER update_requisitions_modtime
        BEFORE UPDATE ON requisitions
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
DO $$
BEGIN
    -- Index for purchase_orders status
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_po_status'
    ) THEN
        CREATE INDEX idx_po_status ON purchase_orders(status);
    END IF;

    -- Index for inventory product_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_inventory_product'
    ) THEN
        CREATE INDEX idx_inventory_product ON inventory(product_id);
    END IF;

    -- Index for purchase_orders supplier_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_po_supplier'
    ) THEN
        CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
    END IF;
END $$;