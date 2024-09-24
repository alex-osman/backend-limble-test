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
