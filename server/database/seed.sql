SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM bookings;
DELETE FROM housing_images;
DELETE FROM housings;

ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE housing_images AUTO_INCREMENT = 1;
ALTER TABLE housings AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO housings (
  id,
  title,
  description,
  location,
  price,
  gender_allowed,
  room_type,
  available_rooms,
  status,
  createdAt,
  updatedAt
)
VALUES
(
  1,
  'سكن الطلاب الجامعي - رفيديا',
  'سكن مريح قريب من جامعة النجاح ومناسب للطلاب مع بيئة هادئة وخدمات أساسية.',
  'Nablus',
  150,
  'male',
  'double',
  5,
  'available',
  NOW(),
  NOW()
),
(
  2,
  'شقة طلابية - شارع الجامعة',
  'شقة طلابية حديثة قرب الجامعة، مناسبة للطالبات وتتميز بالنظافة والموقع الممتاز.',
  'Nablus',
  220,
  'female',
  'single',
  3,
  'available',
  NOW(),
  NOW()
),
(
  3,
  'سكن مشترك - المخفية',
  'سكن اقتصادي للطلاب في نابلس مع غرف مشتركة وموقع قريب من المواصلات.',
  'Nablus',
  120,
  'male',
  'triple',
  4,
  'available',
  NOW(),
  NOW()
),
(
  4,
  'شقق الطلبة - شارع فيصل',
  'سكن طلابي مناسب للذكور والإناث، قريب من الأسواق والخدمات.',
  'Nablus',
  180,
  'both',
  'double',
  2,
  'available',
  NOW(),
  NOW()
),
(
  5,
  'غرفة خاصة - نابلس الجديدة',
  'غرفة خاصة بإطلالة جيدة ومناسبة للطالبات مع مستوى ممتاز من الهدوء.',
  'Nablus',
  260,
  'female',
  'single',
  1,
  'unavailable',
  NOW(),
  NOW()
),
(
  6,
  'سكن قريب من الحرم الجديد',
  'سكن حديث ومناسب للطلاب مع عدد غرف متاح جيد وقريب من الجامعة.',
  'Nablus',
  200,
  'both',
  'double',
  6,
  'available',
  NOW(),
  NOW()
);

INSERT INTO housing_images (
  id,
  housing_id,
  image_url,
  createdAt,
  updatedAt
)
VALUES
(1, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', NOW(), NOW()),
(2, 1, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', NOW(), NOW()),
(3, 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', NOW(), NOW()),
(4, 2, 'https://images.unsplash.com/photo-1484154218962-a197022b5858', NOW(), NOW()),
(5, 3, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', NOW(), NOW()),
(6, 3, 'https://images.unsplash.com/photo-1494526585095-c41746248156', NOW(), NOW()),
(7, 4, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', NOW(), NOW()),
(8, 4, 'https://images.unsplash.com/photo-1484154218962-a197022b5858', NOW(), NOW()),
(9, 5, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', NOW(), NOW()),
(10, 6, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', NOW(), NOW()),
(11, 6, 'https://images.unsplash.com/photo-1494526585095-c41746248156', NOW(), NOW());