-- Create database
CREATE DATABASE IF NOT EXISTS astronomy_portal;
USE astronomy_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  image_caption VARCHAR(255),
  author_id INT,
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Forum topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INT,
  category_id INT,
  reply_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL,
  content TEXT NOT NULL,
  author_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(255) NOT NULL,
  source VARCHAR(255),
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty ENUM('Fácil', 'Medio', 'Difícil') DEFAULT 'Medio',
  time_limit INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Quiz answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score FLOAT NOT NULL,
  correct_answers INT NOT NULL,
  total_questions INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Information topics table
CREATE TABLE IF NOT EXISTS information_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES information_topics(id) ON DELETE SET NULL
);

CREATE TABLE test_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  test_id VARCHAR(100) NOT NULL,
  answers JSON NOT NULL,
  score INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@example.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'admin');

-- Regular user (password: user123)
INSERT INTO users (name, email, password, role) VALUES 
('Usuario', 'usuario@example.com', '$2a$10$rrm9.jBfkhd/Ey27qzHRTuIWvSVrPLP6EXj3D.0RdDJ/OqbITLqIu', 'user');

-- Categories
INSERT INTO categories (name, slug, description) VALUES
('Sistema Solar', 'sistema-solar', 'Información sobre nuestro sistema solar y sus planetas'),
('Astrofísica', 'astrofisica', 'Estudio de la física del universo'),
('Exploración Espacial', 'exploracion-espacial', 'Misiones y descubrimientos espaciales'),
('Astronomía General', 'astronomia-general', 'Conceptos generales de astronomía'),
('Eventos Astronómicos', 'eventos-astronomicos', 'Eclipses, lluvias de meteoros y otros eventos');

-- News
INSERT INTO news (title, summary, content, author_id, category_id) VALUES
('Descubren nuevo exoplaneta potencialmente habitable', 'Científicos han descubierto un nuevo exoplaneta que podría albergar vida.', '<p>Un equipo internacional de astrónomos ha anunciado el descubrimiento de un nuevo exoplaneta que orbita en la zona habitable de su estrella. El planeta, denominado Kepler-452b, tiene un tamaño similar a la Tierra y orbita una estrella parecida a nuestro Sol.</p><p>Este hallazgo es significativo porque el planeta se encuentra en la zona habitable, donde las condiciones podrían permitir la existencia de agua líquida en su superficie, un requisito fundamental para la vida tal como la conocemos.</p><p>Los científicos utilizaron el telescopio espacial Kepler de la NASA para realizar este descubrimiento. Ahora planean realizar más observaciones con instrumentos más avanzados para determinar la composición de su atmósfera y buscar posibles biomarcadores.</p>', 1, 4),
('La NASA anuncia nueva misión a Marte para 2026', 'La agencia espacial estadounidense ha revelado planes para una nueva misión robótica a Marte.', '<p>La NASA ha anunciado oficialmente su próxima misión a Marte, programada para lanzarse en 2026. Esta misión, denominada "Mars Sample Return", tiene como objetivo recoger muestras del suelo marciano y traerlas de vuelta a la Tierra para su análisis detallado.</p><p>Esta será la primera vez que se traigan muestras de Marte a la Tierra, lo que permitirá a los científicos realizar análisis mucho más detallados de lo que es posible con los instrumentos a bordo de los rovers.</p><p>La misión utilizará tecnología de vanguardia, incluyendo un sistema de ascenso marciano que lanzará las muestras a la órbita de Marte, donde serán recogidas por una nave espacial para su regreso a la Tierra.</p>', 1, 3),
('Observan fusión de agujeros negros supermasivos', 'Astrónomos detectan ondas gravitacionales de la fusión de dos agujeros negros supermasivos.', '<p>Un equipo internacional de astrónomos ha detectado ondas gravitacionales procedentes de la fusión de dos agujeros negros supermasivos, un evento cósmico de proporciones colosales que ocurrió hace aproximadamente 7 mil millones de años.</p><p>Esta observación, realizada con el Observatorio de Ondas Gravitacionales por Interferometría Láser (LIGO) y el detector Virgo, marca la primera vez que se detectan ondas gravitacionales de agujeros negros de este tamaño.</p><p>Los agujeros negros involucrados tenían masas estimadas de 66 y 85 veces la masa del Sol, y su fusión liberó una cantidad de energía equivalente a convertir aproximadamente 8 masas solares en ondas gravitacionales.</p>', 1, 2);

-- Forum topics
INSERT INTO forum_topics (title, content, author_id, category_id, reply_count) VALUES
('¿Cómo empezar en astronomía amateur?', '<p>Hola a todos, soy nuevo en el mundo de la astronomía y me gustaría empezar a observar el cielo nocturno. ¿Qué telescopio recomiendan para principiantes? ¿Y qué objetos celestes son buenos para empezar a observar?</p><p>Agradezco cualquier consejo que puedan darme. ¡Gracias!</p>', 2, 4, 1),
('Teorías sobre materia oscura', '<p>Me interesa conocer más sobre las diferentes teorías que existen actualmente sobre la materia oscura. ¿Alguien podría explicar las principales hipótesis y qué evidencias las respaldan?</p><p>También me gustaría saber si hay algún experimento en curso que esté intentando detectar directamente la materia oscura.</p>', 2, 2, 0),
('Próximos eclipses visibles en España', '<p>¿Alguien sabe cuándo será el próximo eclipse solar o lunar visible desde España? Me gustaría planificar con tiempo para poder observarlo y fotografiarlo.</p><p>También agradecería consejos sobre el equipo necesario para fotografiar eclipses de forma segura.</p>', 2, 5, 0);

-- Forum replies
INSERT INTO forum_replies (topic_id, content, author_id) VALUES
(1, '<p>¡Bienvenido al mundo de la astronomía! Para principiantes, recomendaría un telescopio reflector dobsoniano de 6 o 8 pulgadas. Son relativamente económicos, fáciles de usar y tienen suficiente apertura para ver objetos interesantes.</p><p>En cuanto a objetos para observar, puedes empezar con la Luna, que es fácil de localizar y muestra muchos detalles interesantes. Los planetas como Júpiter y Saturno también son buenos objetivos. Más adelante puedes intentar con objetos de cielo profundo como la nebulosa de Orión (M42) o el cúmulo de estrellas de las Pléyades.</p><p>¡Espero que disfrutes de tu nueva afición!</p>', 1);

-- Gallery images
INSERT INTO gallery_images (title, description, url, source, category_id) VALUES
('Nebulosa del Águila', 'La Nebulosa del Águila (M16) es una región de formación estelar situada a unos 7.000 años luz de la Tierra.', 'https://example.com/images/eagle-nebula.jpg', 'NASA/ESA Hubble Space Telescope', 2),
('Júpiter y sus lunas', 'Imagen de Júpiter mostrando la Gran Mancha Roja y tres de sus lunas: Ío, Europa y Ganímedes.', 'https://example.com/images/jupiter.jpg', 'NASA/JPL', 1),
('Rover Perseverance en Marte', 'El rover Perseverance de la NASA explorando el cráter Jezero en Marte.', 'https://example.com/images/perseverance.jpg', 'NASA/JPL-Caltech', 3);

-- Quizzes
INSERT INTO quizzes (title, description, difficulty) VALUES
('Conceptos básicos de astronomía', 'Pon a prueba tus conocimientos sobre conceptos fundamentales de astronomía.', 'Fácil'),
('Sistema Solar avanzado', 'Un test desafiante sobre los planetas, lunas y otros objetos de nuestro Sistema Solar.', 'Difícil'),
('Historia de la exploración espacial', 'Preguntas sobre las misiones espaciales más importantes de la historia.', 'Medio');

-- Quiz questions and answers for "Conceptos básicos de astronomía"
INSERT INTO quiz_questions (quiz_id, question_text) VALUES
(1, '¿Cuál es la estrella más cercana a la Tierra?');
INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES
(1, 'El Sol', TRUE),
(1, 'Proxima Centauri', FALSE),
(1, 'Sirio', FALSE),
(1, 'Alfa Centauri', FALSE);

INSERT INTO quiz_questions (quiz_id, question_text) VALUES
(1, '¿Qué planeta es conocido como el "planeta rojo"?');
INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES
(2, 'Venus', FALSE),
(2, 'Júpiter', FALSE),
(2, 'Marte', TRUE),
(2, 'Mercurio', FALSE);

INSERT INTO quiz_questions (quiz_id, question_text) VALUES
(1, '¿Qué causa las fases de la Luna?');
INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES
(3, 'La sombra de la Tierra sobre la Luna', FALSE),
(3, 'La rotación de la Luna', FALSE),
(3, 'Las diferentes partes iluminadas de la Luna visibles desde la Tierra', TRUE),
(3, 'Las nubes en la atmósfera lunar', FALSE);

-- Information topics
INSERT INTO information_topics (title, slug, description, content, image_url) VALUES
('Sistema Solar', 'sistema-solar', 'Información sobre nuestro sistema solar y sus planetas', '<h2>El Sistema Solar</h2><p>El Sistema Solar es el sistema planetario que liga gravitacionalmente a un conjunto de objetos astronómicos que giran directa o indirectamente en una órbita alrededor de una única estrella conocida como el Sol.</p><p>El Sistema Solar se formó hace unos 4.600 millones de años a partir del colapso de una nube molecular. La mayor parte de la masa del sistema se encuentra en el Sol, con la mayor parte de la masa restante contenida en Júpiter.</p><h3>Componentes principales</h3><ul><li>El Sol: La estrella central</li><li>Planetas: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno</li><li>Planetas enanos: Plutón, Ceres, Haumea, Makemake y Eris</li><li>Satélites naturales (lunas)</li><li>Asteroides</li><li>Cometas</li><li>Cinturón de Kuiper</li><li>Nube de Oort</li></ul>', 'https://example.com/images/solar-system.jpg'),
('Astrofísica Básica', 'astrofisica-basica', 'Conceptos fundamentales de astrofísica', '<h2>Astrofísica Básica</h2><p>La astrofísica es la rama de la astronomía que estudia las propiedades físicas de los objetos del universo, como su luminosidad, densidad, temperatura y composición química.</p><p>Esta disciplina aplica las teorías y métodos de la física para entender los fenómenos que ocurren en el cosmos, desde el comportamiento de las estrellas hasta la evolución de galaxias enteras.</p><h3>Conceptos fundamentales</h3><ul><li>Espectro electromagnético</li><li>Radiación de cuerpo negro</li><li>Efecto Doppler</li><li>Nucleosíntesis estelar</li><li>Relatividad general</li><li>Mecánica cuántica aplicada a fenómenos astronómicos</li></ul>', 'https://example.com/images/astrophysics.jpg'),
('Misiones Espaciales', 'misiones-espaciales', 'Historia y actualidad de la exploración espacial', '<h2>Misiones Espaciales</h2><p>La exploración espacial ha sido uno de los mayores logros de la humanidad en el siglo XX y continúa avanzando en el siglo XXI.</p><p>Desde el lanzamiento del primer satélite artificial, el Sputnik 1, en 1957, hasta las misiones actuales a Marte y más allá, la exploración espacial ha ampliado enormemente nuestro conocimiento del cosmos.</p><h3>Hitos importantes</h3><ul><li>1957: Lanzamiento del Sputnik 1</li><li>1961: Yuri Gagarin se convierte en el primer ser humano en el espacio</li><li>1969: Neil Armstrong y Buzz Aldrin caminan sobre la Luna</li><li>1990: Lanzamiento del telescopio espacial Hubble</li><li>2004: Aterrizaje de los rovers Spirit y Opportunity en Marte</li><li>2021: El helicóptero Ingenuity realiza el primer vuelo controlado en otro planeta</li></ul>', 'https://example.com/images/space-missions.jpg');
