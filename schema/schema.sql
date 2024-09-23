CREATE TABLE locations (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
) ENGINE=INNODB;

CREATE TABLE tasks (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(100) NOT NULL,

  location_id INT(11) NOT NULL,

  is_complete BOOLEAN NOT NULL DEFAULT 0,

  FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE workers (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  hourly_wage DECIMAL(5, 2) NOT NULL
) ENGINE=INNODB;

CREATE TABLE logged_time (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  time_seconds INT(11) NOT NULL,

  task_id INT(11) NOT NULL,
  worker_id INT(11) NOT NULL,

  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY(worker_id) REFERENCES workers(id) ON DELETE CASCADE
) ENGINE=INNODB;

-- SEED DATA
INSERT INTO locations (name) VALUES 
('Warehouse'), 
('Office'), 
('Remote');

INSERT INTO workers (username, hourly_wage) VALUES 
('alice', 20.00), 
('bob', 25.00), 
('charlie', 30.00);

INSERT INTO tasks (description, location_id, is_complete) VALUES 
('Inventory management', 1, true),   
('Office cleanup', 2, false),        
('Remote client call', 3, true);     

INSERT INTO logged_time (time_seconds, task_id, worker_id) VALUES 
(7200, 1, 1), 
(5400, 1, 2), 
(10800, 2, 3),
(9000, 3, 1), 
(3600, 3, 2);