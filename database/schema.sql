-- Database design for a future back end of the ShopEase store.
-- The current website keeps its catalog in script.js and its cart in the browser;
-- this schema shows how the same data would be stored in a relational database.

CREATE TABLE customers (
    id          INTEGER PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE products (
    id          INTEGER PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    category    VARCHAR(50)  NOT NULL,
    price       DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE orders (
    id           INTEGER PRIMARY KEY,
    customer_id  INTEGER NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
    order_id    INTEGER NOT NULL,
    product_id  INTEGER NOT NULL,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    unit_price  DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Sample data
INSERT INTO products (id, name, category, price) VALUES
    (1, 'Wireless Headphones', 'Electronics', 59.99),
    (2, 'Smart Watch',         'Electronics', 89.00),
    (5, 'C++ Programming Book','Books',       32.00);

INSERT INTO customers (id, name, email) VALUES (1, 'Sample Customer', 'customer@example.com');
INSERT INTO orders (id, customer_id) VALUES (1, 1);
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 59.99),
    (1, 5, 2, 32.00);

-- Example report: total of every order
SELECT o.id AS order_id, c.name AS customer, SUM(oi.quantity * oi.unit_price) AS order_total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.name;
