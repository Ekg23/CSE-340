-- 1. Insert Tony Stark into the account table
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n')

-- 2. Modify Tony Stark's account type to Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony'
AND account_lastname = 'Stark';

-- 3. Delete the Tony Stark record
DELETE FROM account
WHERE account_firstname = 'Tony'
AND account_lastname = 'Stark';

-- 4. Update the GM Hummer description using REPLACE
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM'
AND inv_model = 'Hummer';

-- 5. Use an INNER JOIN to get vehicles in the Sport classification
SELECT inv_make, inv_model, classification_name
FROM inventory
INNER JOIN classification
ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

-- 6. Update image paths to include /vehicles
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');