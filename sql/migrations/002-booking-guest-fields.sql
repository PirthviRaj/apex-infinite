-- Incremental migration: booking guest identity + order link
-- Run only if you already have an older apex DB and cannot run full db:init
-- mysql -u root -p apex < sql/migrations/002-booking-guest-fields.sql

USE `apex`;

ALTER TABLE bookings
  ADD COLUMN order_id VARCHAR(64) NULL AFTER id,
  ADD COLUMN reference VARCHAR(32) NULL AFTER title,
  ADD COLUMN guest_name VARCHAR(255) NULL AFTER reference,
  ADD COLUMN guest_phone VARCHAR(32) NULL AFTER guest_name,
  ADD COLUMN guest_email VARCHAR(255) NULL AFTER guest_phone;

ALTER TABLE bookings
  MODIFY COLUMN resource_id VARCHAR(255) NULL,
  MODIFY COLUMN amount_cents INT NOT NULL DEFAULT 0;

UPDATE bookings SET reference = CONCAT('APX-LEGACY-', LEFT(id, 8)) WHERE reference IS NULL;
UPDATE bookings SET guest_name = 'Legacy Guest' WHERE guest_name IS NULL;
UPDATE bookings SET guest_phone = '0000000000' WHERE guest_phone IS NULL;
UPDATE bookings SET guest_email = 'legacy@apex.app' WHERE guest_email IS NULL;

ALTER TABLE bookings
  MODIFY COLUMN reference VARCHAR(32) NOT NULL,
  MODIFY COLUMN guest_name VARCHAR(255) NOT NULL,
  MODIFY COLUMN guest_phone VARCHAR(32) NOT NULL,
  MODIFY COLUMN guest_email VARCHAR(255) NOT NULL;

ALTER TABLE bookings
  ADD UNIQUE KEY uq_bookings_reference (reference),
  ADD INDEX idx_bookings_order (order_id),
  ADD INDEX idx_bookings_guest_email (guest_email),
  ADD INDEX idx_bookings_resource (module_id, resource_type, resource_id(64));

ALTER TABLE orders ADD INDEX idx_orders_tracking (tracking_code);
ALTER TABLE payments ADD INDEX idx_payments_order (order_id);
ALTER TABLE payments ADD INDEX idx_payments_ref (provider_ref);
