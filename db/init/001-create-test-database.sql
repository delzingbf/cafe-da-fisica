--- Only for testing

CREATE DATABASE cafe_da_fisica_test;

CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE order_payment_option AS ENUM ('pix', 'cash');
CREATE TYPE order_delivery_method AS ENUM ('delivery', 'pickup');

CREATE DOMAIN email AS TEXT
    CHECK (VALUE ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    CHECK (VALUE = lower(VALUE));

CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    price       NUMERIC(10,2) NOT NULL,
    shown       BOOLEAN NOT NULL DEFAULT TRUE,
    available   BOOLEAN NOT NULL DEFAULT TRUE,
    vegan       BOOLEAN NOT NULL DEFAULT FALSE,
    image_url   TEXT
);

CREATE TABLE orders (
    id                  SERIAL PRIMARY KEY,
    customer_name       TEXT NOT NULL,
    customer_email      email NOT NULL,
    payment_option      order_payment_option NOT NULL DEFAULT 'pix',
    status              order_status NOT NULL DEFAULT 'pending',
    delivery_method     order_delivery_method NOT NULL DEFAULT 'delivery',
    delivery_location   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    order_id    INT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products (id),
    quantity    INT NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10,2) NOT NULL,

    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE admins (
    id              SERIAL PRIMARY KEY,
    email           email NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);

CREATE TABLE settings (
    id                          BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
    order_notification_email    email NOT NULL,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  INT REFERENCES admins (id) ON DELETE SET NULL
);