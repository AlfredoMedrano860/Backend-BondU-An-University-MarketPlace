BEGIN;

TRUNCATE TABLE
  reviews_answers, reviews, user_favorites, product_images, products,
  user_roles, user_preferences, user_contact, user_stats, notifications,
  users, user_role_types, notification_types, product_conditions, product_status
CASCADE;

DO $$
DECLARE
  role_seller_id uuid;
  role_buyer_id uuid;
  hashed_password text := '$2b$12$2t9Pm91aFeLadri0D2rjLOPD3yqSFB6sGFqxNx/btpt2kfz2gd7JO'; -- "bondu1234"
  base_url text := 'http://localhost:3000';
  avatar_url text;

  u_alfredo uuid;
  u_camila uuid;
  u_diego uuid;
  u_valentina uuid;

  cond_nuevo uuid;
  cond_usado uuid;
  cond_detalle uuid;
  status_disponible uuid;

  p_audifonos uuid;
  p_colores uuid;
  p_laptop uuid;
  p_mouse uuid;
  p_pendrive uuid;
  p_pinceles uuid;
  p_pinturas uuid;
  p_tableta uuid;
  p_teclado uuid;
  p_tijeras uuid;
  p_usb uuid;

  review_camila_alfredo uuid;

  nt_success uuid;
  nt_error uuid;
  nt_warning uuid;
  nt_info uuid;
BEGIN
  avatar_url := base_url || '/uploads/IconoPerfil.webp';

  -- ===== UsersSeed =====

  INSERT INTO user_role_types (role_name) VALUES ('seller') RETURNING role_type_id INTO role_seller_id;
  INSERT INTO user_role_types (role_name) VALUES ('buyer')  RETURNING role_type_id INTO role_buyer_id;

  INSERT INTO users (username, email, password, avatar, phone, location, university, career)
  VALUES ('Alfredo Medrano', 'mc.alfredomedra@gmail.com', hashed_password, avatar_url, '+506 8812-3456', 'Esparza, Puntarenas', 'UCR', 'Ingeniería Informática')
  RETURNING id INTO u_alfredo;

  INSERT INTO users (username, email, password, avatar, phone, location, university, career)
  VALUES ('Camila Rojas', 'camila.rojas@ucr.ac.cr', hashed_password, avatar_url, '+506 7723-4567', 'San José, Costa Rica', 'UCR', 'Comunicación')
  RETURNING id INTO u_camila;

  INSERT INTO users (username, email, password, avatar, phone, location, university, career)
  VALUES ('Diego Herrera', 'diego.herrera@tec.ac.cr', hashed_password, avatar_url, '+506 6634-5678', 'Cartago, Costa Rica', 'TEC', 'Computación')
  RETURNING id INTO u_diego;

  INSERT INTO users (username, email, password, avatar, phone, location, university, career)
  VALUES ('Valentina Cruz', 'valentina.cruz@una.ac.cr', hashed_password, avatar_url, '+506 5545-6789', 'Heredia, Costa Rica', 'UNA', 'Diseño')
  RETURNING id INTO u_valentina;

  -- user_stats (sample)
  INSERT INTO user_stats (user_id, rating_avg, review_count, sales_count) VALUES
    (u_alfredo,   '3.0', 50, 40),
    (u_camila,    '4.5', 28, 22),
    (u_diego,     '4.0', 15, 11),
    (u_valentina, '5.0', 8,  7);

  -- user_contact
  INSERT INTO user_contact (user_id, bio, instagram, telegram) VALUES
    (u_alfredo,   'Estudiante de Ingeniería en la UCR. Vendo apuntes, libros y accesorios tech.', 'alfredo.ucr', 'alfredo_ucr'),
    (u_camila,    'Comunicadora apasionada. Ofrezco materiales de diseño y libros de comunicación.', 'camila.rojas', 'camila_rojas'),
    (u_diego,     'Dev en el TEC. Vendo libros de computación y gadgets.', 'diego.tec', 'diego_tec'),
    (u_valentina, 'Diseñadora en la UNA. Especializada en materiales de arte y diseño.', 'vale.una', 'vale_una');

  -- user_preferences
  INSERT INTO user_preferences (user_id, language, notifications) VALUES
    (u_alfredo,   'es', true),
    (u_camila,    'es', true),
    (u_diego,     'es', true),
    (u_valentina, 'es', true);

  -- user_roles: todos parten como compradores; estos 4 ya tienen productos, asi que tambien son vendedores
  INSERT INTO user_roles (user_id, role_type_id) VALUES
    (u_alfredo,   role_buyer_id),
    (u_alfredo,   role_seller_id),
    (u_camila,    role_buyer_id),
    (u_camila,    role_seller_id),
    (u_diego,     role_buyer_id),
    (u_diego,     role_seller_id),
    (u_valentina, role_buyer_id),
    (u_valentina, role_seller_id);

  -- ===== ProductsSeed =====

  INSERT INTO product_conditions (name_condition) VALUES ('Nuevo')   RETURNING condition_id INTO cond_nuevo;
  INSERT INTO product_conditions (name_condition) VALUES ('Usado')   RETURNING condition_id INTO cond_usado;
  INSERT INTO product_conditions (name_condition) VALUES ('Detalle') RETURNING condition_id INTO cond_detalle;

  INSERT INTO product_status (name_status) VALUES ('Disponible') RETURNING status_id INTO status_disponible;
  INSERT INTO product_status (name_status) VALUES ('Vendido');

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Audífonos inalámbricos', 'Audífonos inalámbricos negros con diseño moderno y acabado minimalista. Cuentan con almohadillas cómodas para uso prolongado y diadema ajustable para mejor adaptación. En buen estado, con poco uso.', 60, u_diego, cond_usado, status_disponible)
    RETURNING product_id INTO p_audifonos;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Set de lápices de colores', 'Set de 24 lápices de colores en organizador cilíndrico. Colores vibrantes ideales para trabajos de diseño, apuntes ilustrados o proyectos de arte.', 6, u_valentina, cond_nuevo, status_disponible)
    RETURNING product_id INTO p_colores;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Laptop para estudio', 'Laptop en buen estado, ideal para tareas, investigación y clases virtuales. Pantalla nítida, buena duración de batería y rendimiento fluido para uso académico.', 350, u_alfredo, cond_usado, status_disponible)
    RETURNING product_id INTO p_laptop;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Mouse inalámbrico', 'Mouse inalámbrico blanco y negro, ergonómico y silencioso. Conexión estable vía USB. Con un pequeño detalle estético en la carcasa que no afecta su funcionamiento.', 12, u_camila, cond_detalle, status_disponible)
    RETURNING product_id INTO p_mouse;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Pendrive 32GB', 'Memoria USB de 32GB con cuerpo metálico resistente y tapa protectora. Perfecta para respaldar trabajos, presentaciones y documentos de clase.', 8, u_diego, cond_nuevo, status_disponible)
    RETURNING product_id INTO p_pendrive;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Set de pinceles para pintura', 'Set de pinceles de cerdas sintéticas con mango de madera, en distintos tamaños. Ideales para acrílico, acuarela o proyectos de arte. Con uso moderado, cerdas en buen estado.', 10, u_valentina, cond_usado, status_disponible)
    RETURNING product_id INTO p_pinceles;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Set de pinturas con paleta', 'Set de pinturas de colores surtidos junto con paleta de mezcla. Algunos colores con uso, pero con suficiente pintura para varios proyectos de arte o diseño.', 15, u_alfredo, cond_detalle, status_disponible)
    RETURNING product_id INTO p_pinturas;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Tableta gráfica', 'Tableta gráfica con lápiz sensible a la presión, ideal para dibujo digital, edición e ilustración. Compatible con laptop y programas de diseño. Con uso, funcionando perfectamente.', 80, u_camila, cond_usado, status_disponible)
    RETURNING product_id INTO p_tableta;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Teclado inalámbrico', 'Teclado inalámbrico compacto y silencioso, compatible con laptop y tablet. Ideal para escribir trabajos y tomar apuntes con mayor comodidad.', 20, u_diego, cond_nuevo, status_disponible)
    RETURNING product_id INTO p_teclado;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Tijeras escolares', 'Tijeras de tamaño estándar, filo preciso y mango ergonómico. Útiles para manualidades, proyectos y trabajos de clase.', 4, u_valentina, cond_nuevo, status_disponible)
    RETURNING product_id INTO p_tijeras;

  INSERT INTO products (name, description, price, seller_id, condition_id, status_id) VALUES
    ('Cable USB', 'Cable USB-A a Micro-USB, plano y resistente a enredos. Conector con un leve desgaste por uso, pero funciona sin problema para cargar y transferir datos.', 5, u_alfredo, cond_detalle, status_disponible)
    RETURNING product_id INTO p_usb;

  -- product_images: 1 principal + 3 de galeria por producto (Tableta usa solo galeria)
  INSERT INTO product_images (product_id, url, is_primary) VALUES
    (p_audifonos, base_url || '/uploads/AudifonosProducto.webp', true),
    (p_audifonos, base_url || '/uploads/AudifonosGallery1.webp', false),
    (p_audifonos, base_url || '/uploads/AudifonosGallery2.webp', false),
    (p_audifonos, base_url || '/uploads/AudifonosGallery3.webp', false),

    (p_colores, base_url || '/uploads/ColoresProducto.webp', true),
    (p_colores, base_url || '/uploads/ColoresGallery1.webp', false),
    (p_colores, base_url || '/uploads/ColoresGallery2.webp', false),
    (p_colores, base_url || '/uploads/ColoresGallery3.webp', false),

    (p_laptop, base_url || '/uploads/LaptopProducto.webp', true),
    (p_laptop, base_url || '/uploads/LaptopGallery1.webp', false),
    (p_laptop, base_url || '/uploads/LaptopGallery2.webp', false),
    (p_laptop, base_url || '/uploads/LaptopGallery3.webp', false),

    (p_mouse, base_url || '/uploads/MouseProducto.webp', true),
    (p_mouse, base_url || '/uploads/MouseGallery1.webp', false),
    (p_mouse, base_url || '/uploads/MouseGallery2.webp', false),
    (p_mouse, base_url || '/uploads/MouseGallery3.webp', false),

    (p_pendrive, base_url || '/uploads/PendriveProducto.webp', true),
    (p_pendrive, base_url || '/uploads/PendriveGallery1.webp', false),
    (p_pendrive, base_url || '/uploads/PendriveGallery2.webp', false),
    (p_pendrive, base_url || '/uploads/PendriveGallery3.webp', false),

    (p_pinceles, base_url || '/uploads/PincelesProducto.webp', true),
    (p_pinceles, base_url || '/uploads/PincelesGallery1.webp', false),
    (p_pinceles, base_url || '/uploads/PincelesGallery2.webp', false),
    (p_pinceles, base_url || '/uploads/PincelesGallery3.webp', false),

    (p_pinturas, base_url || '/uploads/PinturasProducto.webp', true),
    (p_pinturas, base_url || '/uploads/PinturasGallery1.webp', false),
    (p_pinturas, base_url || '/uploads/PinturasGallery2.webp', false),
    (p_pinturas, base_url || '/uploads/PinturasGallery3.webp', false),

    -- Tableta: no hay imagen de producto propia, se reutiliza la primera de galeria como principal
    (p_tableta, base_url || '/uploads/TabletaGallery1.webp', true),
    (p_tableta, base_url || '/uploads/TabletaGallery2.webp', false),
    (p_tableta, base_url || '/uploads/TabletaGallery3.webp', false),

    (p_teclado, base_url || '/uploads/TecladoProducto.webp', true),
    (p_teclado, base_url || '/uploads/TecladoGallery1.webp', false),
    (p_teclado, base_url || '/uploads/TecladoGallery2.webp', false),
    (p_teclado, base_url || '/uploads/TecladoGallery3.webp', false),

    (p_tijeras, base_url || '/uploads/TijerasProducto.webp', true),
    (p_tijeras, base_url || '/uploads/TijerasGallery1.webp', false),
    (p_tijeras, base_url || '/uploads/TijerasGallery2.webp', false),
    (p_tijeras, base_url || '/uploads/TijerasGallery3.webp', false),

    (p_usb, base_url || '/uploads/USBProducto.webp', true),
    (p_usb, base_url || '/uploads/USBGallery1.webp', false),
    (p_usb, base_url || '/uploads/USBGallery2.webp', false),
    (p_usb, base_url || '/uploads/USBGallery3.webp', false);

  -- ===== ReviewsSeed =====

  INSERT INTO reviews (reviewer_id, seller_id, rating, comment) VALUES
    (u_camila, u_alfredo, '3', 'Todo bien, aunque el envío tardó un poco más de lo esperado.')
    RETURNING id INTO review_camila_alfredo;

  INSERT INTO reviews (reviewer_id, seller_id, rating, comment) VALUES
    (u_diego,     u_camila,    '5', 'Vendedora muy amable, el artículo llegó en excelente estado.'),
    (u_alfredo,   u_camila,    '4', 'Buena experiencia, respondió rápido y coordinó bien la entrega.'),
    (u_valentina, u_camila,    '5', 'Todo perfecto, lo recomiendo sin dudar.'),
    (u_camila,    u_diego,     '4', 'Buen vendedor, el artículo estaba en buen estado.'),
    (u_diego,     u_valentina, '5', 'Increíble vendedora, súper detallista con el empaque.'),
    (u_alfredo,   u_valentina, '5', 'Producto impecable y atención de primera.');

  INSERT INTO reviews_answers (review_id, comment) VALUES
    (review_camila_alfredo, '¡Gracias por tu reseña! Intentaré mejorar los tiempos de envío.');

  -- Promedios reales tras las reseñas (sales_count queda igual que en UsersSeed)
  UPDATE user_stats SET rating_avg = '3.0', review_count = 1 WHERE user_id = u_alfredo;
  UPDATE user_stats SET rating_avg = '4.7', review_count = 3 WHERE user_id = u_camila;
  UPDATE user_stats SET rating_avg = '4.0', review_count = 1 WHERE user_id = u_diego;
  UPDATE user_stats SET rating_avg = '5.0', review_count = 2 WHERE user_id = u_valentina;

  -- ===== NotificationsSeed =====

  INSERT INTO notification_types (notification_type_name) VALUES ('success') RETURNING notification_type_id INTO nt_success;
  INSERT INTO notification_types (notification_type_name) VALUES ('error')   RETURNING notification_type_id INTO nt_error;
  INSERT INTO notification_types (notification_type_name) VALUES ('warning') RETURNING notification_type_id INTO nt_warning;
  INSERT INTO notification_types (notification_type_name) VALUES ('info')    RETURNING notification_type_id INTO nt_info;

  INSERT INTO notifications (notification_type_id, is_read, read_at) VALUES
    (nt_success, false, NULL),
    (nt_error,   true,  now()),
    (nt_warning, false, NULL),
    (nt_info,    false, NULL);

END $$;

COMMIT;
