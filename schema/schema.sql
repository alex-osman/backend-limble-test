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
('Remote'), 
('Factory'), 
('Field');

INSERT INTO workers (username, hourly_wage) VALUES 
('alice', 20.00), 
('bob', 25.00), 
('charlie', 30.00),
('dave', 35.00),
('eve', 40.00);

INSERT INTO tasks (description, location_id, is_complete) VALUES 
('Inventory management', 1, true),    -- Task in Warehouse, complete
('Office cleanup', 2, false),         -- Task in Office, incomplete
('Remote client call', 3, true),      -- Task remotely, complete
('Factory machine maintenance', 4, true), -- Task in Factory, complete
('Field survey', 5, false),           -- Task in Field, incomplete
('Warehouse restocking', 1, true),    -- Task in Warehouse, complete
('Office renovation', 2, false),      -- Task in Office, incomplete
('Remote training', 3, true),         -- Task remotely, complete
('Factory inspection', 4, false),     -- Task in Factory, incomplete
('Field equipment setup', 5, true);   -- Task in Field, complete

INSERT INTO logged_time (time_seconds, task_id, worker_id) VALUES 
(7200, 1, 1), 
(5400, 1, 2), 
(10800, 2, 3),
(9000, 3, 1), 
(3600, 3, 2),
(14400, 4, 4),
(9000, 5, 5),
(10800, 6, 1), 
(7200, 6, 3),
(14400, 8, 2),
(12600, 9, 4),
(7200, 10, 5);
