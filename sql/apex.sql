-- Apex Infinite — MySQL schema + seed
-- Database: apex
-- Run: npm run db:init

CREATE DATABASE IF NOT EXISTS `apex` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `apex`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS intent_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS otp_challenges;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS credentials;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Auth & identity
CREATE TABLE users (
  id                 VARCHAR(64) PRIMARY KEY,
  email              VARCHAR(255) NULL UNIQUE,
  username           VARCHAR(64) NULL UNIQUE,
  phone              VARCHAR(32) NULL UNIQUE,
  name               VARCHAR(255) NOT NULL,
  avatar             TEXT NULL,
  provider           ENUM('phone','email','google','apple','github') NOT NULL DEFAULT 'email',
  phone_verified_at  VARCHAR(40) NULL,
  created_at         VARCHAR(40) NOT NULL,
  updated_at         VARCHAR(40) NOT NULL,
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE credentials (
  user_id       VARCHAR(64) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  salt          VARCHAR(64) NOT NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_credentials_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sessions (
  token         VARCHAR(64) PRIMARY KEY,
  user_id       VARCHAR(64) NOT NULL,
  expires_at    VARCHAR(40) NOT NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE otp_challenges (
  id            VARCHAR(64) PRIMARY KEY,
  challenge_key VARCHAR(255) NOT NULL UNIQUE,
  code          VARCHAR(16) NOT NULL,
  channel       ENUM('sms','email','social') NOT NULL DEFAULT 'sms',
  purpose       VARCHAR(32) NOT NULL DEFAULT 'login',
  attempts      INT NOT NULL DEFAULT 0,
  meta_json     TEXT NULL,
  expires_at    VARCHAR(40) NOT NULL,
  created_at    VARCHAR(40) NOT NULL,
  INDEX idx_otp_expires (expires_at),
  INDEX idx_otp_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Module catalog
CREATE TABLE modules (
  id            VARCHAR(64) PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  tagline       VARCHAR(255) NOT NULL,
  href          VARCHAR(255) NOT NULL,
  accent        VARCHAR(32) NOT NULL,
  glow          VARCHAR(64) NOT NULL,
  status        ENUM('live','beta','soon') NOT NULL DEFAULT 'live',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id            VARCHAR(64) PRIMARY KEY,
  module_id     VARCHAR(64) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT NULL,
  price_cents   INT NOT NULL DEFAULT 0,
  currency      VARCHAR(8) NOT NULL DEFAULT 'USD',
  image_url     TEXT NULL,
  meta_json     TEXT NULL,
  active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_products_module FOREIGN KEY (module_id) REFERENCES modules(id),
  INDEX idx_products_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE carts (
  id            VARCHAR(64) PRIMARY KEY,
  user_id       VARCHAR(64) NOT NULL,
  module_id     VARCHAR(64) NOT NULL,
  status        ENUM('open','checked_out','abandoned') NOT NULL DEFAULT 'open',
  updated_at    VARCHAR(40) NOT NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_carts_module FOREIGN KEY (module_id) REFERENCES modules(id),
  INDEX idx_carts_user (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cart_items (
  id            VARCHAR(64) PRIMARY KEY,
  cart_id       VARCHAR(64) NOT NULL,
  product_id    VARCHAR(64) NOT NULL,
  qty           INT NOT NULL DEFAULT 1,
  unit_price_cents INT NOT NULL,
  meta_json     TEXT NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY uq_cart_product (cart_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE addresses (
  id            VARCHAR(64) PRIMARY KEY,
  user_id       VARCHAR(64) NOT NULL,
  label         VARCHAR(64) NULL,
  line1         VARCHAR(255) NOT NULL,
  line2         VARCHAR(255) NULL,
  city          VARCHAR(128) NOT NULL,
  state         VARCHAR(64) NULL,
  postal_code   VARCHAR(32) NULL,
  country       VARCHAR(8) NOT NULL DEFAULT 'US',
  is_default    TINYINT(1) NOT NULL DEFAULT 0,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id            VARCHAR(64) PRIMARY KEY,
  user_id       VARCHAR(64) NOT NULL,
  module_id     VARCHAR(64) NOT NULL,
  status        ENUM('pending','paid','processing','shipped','delivered','completed','cancelled') NOT NULL DEFAULT 'pending',
  total_cents   INT NOT NULL DEFAULT 0,
  currency      VARCHAR(8) NOT NULL DEFAULT 'USD',
  payment_method ENUM('card','apexpay','cash') NULL,
  personal_json TEXT NULL,
  address_json  TEXT NULL,
  tracking_code VARCHAR(64) NULL,
  created_at    VARCHAR(40) NOT NULL,
  updated_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_orders_module FOREIGN KEY (module_id) REFERENCES modules(id),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_module (module_id),
  INDEX idx_orders_tracking (tracking_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id            VARCHAR(64) PRIMARY KEY,
  order_id      VARCHAR(64) NOT NULL,
  product_id    VARCHAR(64) NULL,
  name          VARCHAR(255) NOT NULL,
  qty           INT NOT NULL DEFAULT 1,
  unit_price_cents INT NOT NULL,
  meta_json     TEXT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id            VARCHAR(64) PRIMARY KEY,
  order_id      VARCHAR(64) NOT NULL,
  method        ENUM('card','apexpay','cash') NOT NULL,
  amount_cents  INT NOT NULL,
  status        ENUM('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
  card_last4    VARCHAR(8) NULL,
  provider_ref  VARCHAR(128) NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_payments_order (order_id),
  INDEX idx_payments_ref (provider_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wallets (
  user_id       VARCHAR(64) PRIMARY KEY,
  balance_cents INT NOT NULL DEFAULT 0,
  currency      VARCHAR(8) NOT NULL DEFAULT 'USD',
  updated_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wallet_transactions (
  id            VARCHAR(64) PRIMARY KEY,
  user_id       VARCHAR(64) NOT NULL,
  type          ENUM('credit','debit','p2p','bill','refund') NOT NULL,
  amount_cents  INT NOT NULL,
  label         VARCHAR(255) NOT NULL,
  counterparty  VARCHAR(255) NULL,
  meta_json     TEXT NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_wallet_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_wallet_tx_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Module bookings: travel, workspace, restaurant, events, wellness
-- Linked to orders/payments; guest identity stored for audit & support
CREATE TABLE bookings (
  id            VARCHAR(64) PRIMARY KEY,
  order_id      VARCHAR(64) NOT NULL,
  user_id       VARCHAR(64) NOT NULL,
  module_id     VARCHAR(64) NOT NULL,
  resource_type VARCHAR(64) NOT NULL,
  resource_id   VARCHAR(255) NULL,
  title         VARCHAR(255) NOT NULL,
  reference     VARCHAR(32) NOT NULL,
  guest_name    VARCHAR(255) NOT NULL,
  guest_phone   VARCHAR(32) NOT NULL,
  guest_email   VARCHAR(255) NOT NULL,
  status        ENUM('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'confirmed',
  starts_at     VARCHAR(40) NULL,
  ends_at       VARCHAR(40) NULL,
  amount_cents  INT NOT NULL DEFAULT 0,
  meta_json     TEXT NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_bookings_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_module FOREIGN KEY (module_id) REFERENCES modules(id),
  UNIQUE KEY uq_bookings_reference (reference),
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_module (module_id),
  INDEX idx_bookings_order (order_id),
  INDEX idx_bookings_guest_email (guest_email),
  INDEX idx_bookings_resource (module_id, resource_type, resource_id(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE intent_logs (
  id            VARCHAR(64) PRIMARY KEY,
  user_id       VARCHAR(64) NULL,
  query         TEXT NOT NULL,
  module_id     VARCHAR(64) NULL,
  action        VARCHAR(64) NULL,
  confidence    DOUBLE NULL,
  entities_json TEXT NULL,
  created_at    VARCHAR(40) NOT NULL,
  CONSTRAINT fk_intent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_intent_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed catalog
INSERT INTO modules (id, name, tagline, href, accent, glow, status, sort_order, created_at) VALUES
  ('travel',     'Travel Suite',        'Flights & hotels in 3D',           '/modules/travel',     '#a855f7', 'rgba(168,85,247,0.4)',  'live', 1,  UTC_TIMESTAMP()),
  ('food',       'Food & Grocery',      'Fly-to-cart delivery',             '/modules/food',       '#22d3ee', 'rgba(34,211,238,0.4)',  'live', 2,  UTC_TIMESTAMP()),
  ('workspace',  'WorkSpace Hub',       'Book desks on floor plans',        '/modules/workspace',  '#fbbf24', 'rgba(251,191,36,0.35)', 'live', 3,  UTC_TIMESTAMP()),
  ('restaurant', 'Restaurant Hub',      'Live table availability',          '/modules/restaurant', '#f472b6', 'rgba(244,114,182,0.35)','live', 4,  UTC_TIMESTAMP()),
  ('glide',      'Apex Glide',          'Rides & rentals live',             '/modules/glide',      '#34d399', 'rgba(52,211,153,0.35)', 'live', 5,  UTC_TIMESTAMP()),
  ('events',     'Pulse Events',        'Interactive seat maps',            '/modules/events',     '#fb7185', 'rgba(251,113,133,0.35)','live', 6,  UTC_TIMESTAMP()),
  ('wellness',   'ZenFlow Wellness',    'Doctors & spa booking',            '/modules/wellness',   '#2dd4bf', 'rgba(45,212,191,0.35)', 'live', 7,  UTC_TIMESTAMP()),
  ('pay',        'ApexPay',             'Wallet, P2P & bills',              '/modules/pay',        '#fbbf24', 'rgba(251,191,36,0.4)',  'live', 8,  UTC_TIMESTAMP()),
  ('vogue',      'Vogue AI',            'AI personal stylist',              '/modules/vogue',      '#c084fc', 'rgba(192,132,252,0.4)', 'live', 9,  UTC_TIMESTAMP()),
  ('taskmaster', 'TaskMaster',          'Verified home services',           '/modules/taskmaster', '#67e8f9', 'rgba(103,232,249,0.35)','live', 10, UTC_TIMESTAMP()),
  ('rizz',       'Social Rizz & SEO',   'Conversation & content AI',        '/modules/rizz',       '#e879f9', 'rgba(232,121,249,0.4)', 'live', 11, UTC_TIMESTAMP());

INSERT INTO products (id, module_id, name, description, price_cents, image_url, meta_json, created_at) VALUES
  ('food_ramen',   'food',  'Neon Ramen Bowl',     'Spicy city ramen with soft egg', 1850, NULL, '{"eta":"22 min"}', UTC_TIMESTAMP()),
  ('food_sushi',   'food',  'Orbit Sushi Set',     '8-piece chef selection',         2400, NULL, '{"eta":"28 min"}', UTC_TIMESTAMP()),
  ('food_grocery', 'food',  'Weekly Grocery Pack', 'Essentials restock box',         4200, NULL, '{"eta":"45 min"}', UTC_TIMESTAMP()),
  ('glide_airport','glide', 'Airport Glide',       'Priority ride to airport',       3200, NULL, '{"type":"ride"}', UTC_TIMESTAMP()),
  ('glide_city',   'glide', 'City Hop',            'Downtown quick ride',            1200, NULL, '{"type":"ride"}', UTC_TIMESTAMP()),
  ('travel_nyc',   'travel','NYC Weekender',       'Round-trip city escape',        42000, NULL, '{"nights":2}', UTC_TIMESTAMP()),
  ('travel_tokyo', 'travel','Tokyo Package',       'Neon nights destination',        84200, NULL, '{"city":"Tokyo","country":"Japan"}', UTC_TIMESTAMP()),
  ('travel_dubai', 'travel','Dubai Package',       'Gold coast destination',         61900, NULL, '{"city":"Dubai","country":"UAE"}', UTC_TIMESTAMP()),
  ('travel_paris', 'travel','Paris Package',       'Romance + style destination',    49800, NULL, '{"city":"Paris","country":"France"}', UTC_TIMESTAMP()),
  ('travel_bali',  'travel','Bali Package',        'Zen escape destination',         71200, NULL, '{"city":"Bali","country":"Indonesia"}', UTC_TIMESTAMP()),
  ('ws_desk',      'workspace','Desk Seat Day',   'Open studio desk · Level 12',    2500, NULL, '{"type":"desk","floor":"Level 12"}', UTC_TIMESTAMP()),
  ('ws_focus',     'workspace','Focus Pod Day',   'Quiet focus seat · Level 12',    3500, NULL, '{"type":"focus","floor":"Level 12"}', UTC_TIMESTAMP()),
  ('ws_meeting',   'workspace','Meeting Room Hour','Team meeting room · Level 12',   4500, NULL, '{"type":"meeting","floor":"Level 12"}', UTC_TIMESTAMP()),
  ('rest_nova',    'restaurant','Nova Omakase Table','Japanese · Downtown deposit', 2000, NULL, '{"cuisine":"Japanese","area":"Downtown"}', UTC_TIMESTAMP()),
  ('rest_ember',   'restaurant','Ember Steakhouse Table','Grill · Midtown deposit', 2500, NULL, '{"cuisine":"Grill","area":"Midtown"}', UTC_TIMESTAMP()),
  ('rest_petal',   'restaurant','Petal Garden Table','Vegan · Arts District deposit',1500, NULL, '{"cuisine":"Vegan","area":"Arts District"}', UTC_TIMESTAMP()),
  ('rest_azure',   'restaurant','Azure Rooftop Table','Mediterranean · Harbor deposit',2200, NULL, '{"cuisine":"Mediterranean","area":"Harbor"}', UTC_TIMESTAMP()),
  ('events_neon',  'events','Neon Symphony Ticket', 'Concert floor seat',             8900, NULL, '{"eventType":"Concert"}', UTC_TIMESTAMP()),
  ('events_orbit', 'events','Orbit Premiere Ticket','Movie screening seat',           1800, NULL, '{"eventType":"Movie"}', UTC_TIMESTAMP()),
  ('events_pulse', 'events','Pulse Arena Live Ticket','Sports arena seat',          12000, NULL, '{"eventType":"Sports"}', UTC_TIMESTAMP()),
  ('well_dr_maya', 'wellness','Dr. Maya Chen Visit', 'General physician appointment',7500, NULL, '{"kind":"Doctor"}', UTC_TIMESTAMP()),
  ('well_spa',     'wellness','Aurora Spa Ritual',   '90-min recovery massage',      9500, NULL, '{"kind":"Spa","duration":90}', UTC_TIMESTAMP()),
  ('well_dr_leo',  'wellness','Dr. Leo Park Dental', 'Dental checkup appointment',   8500, NULL, '{"kind":"Doctor"}', UTC_TIMESTAMP()),
  ('well_yoga',    'wellness','ZenFlow Private Yoga','Breath + mobility session',    5500, NULL, '{"kind":"Spa"}', UTC_TIMESTAMP()),
  ('vogue_jacket', 'vogue', 'Apex Night Jacket',   'Limited drop outerwear',         8900, NULL, '{"size":"M"}', UTC_TIMESTAMP()),
  ('pay_topup',    'pay',   'Wallet Top-up $50',   'Add funds to ApexPay',           5000, NULL, '{"kind":"topup"}', UTC_TIMESTAMP());
