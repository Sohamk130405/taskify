create database taskify;
use taskify;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone varchar(10) not null,
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE Organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE TABLE UserOrganizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    role ENUM('admin', 'member') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (organization_id) REFERENCES Organizations(id)
);

CREATE TABLE Boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization_id INT NOT NULL,
    img VARCHAR(255) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES Organizations(id),
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE TABLE Cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    board_id INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES Boards(id),
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE TABLE Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INT,
    card_id INT NOT NULL,
    board_id INT NOT NULL,
    org_id INT NOT NULL,
    assigned_to INT,
    img VARCHAR(255),
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES Cards(id),
    FOREIGN KEY (org_id) REFERENCES Organizations(id),
    FOREIGN KEY (board_id) REFERENCES Boards(id),
    FOREIGN KEY (assigned_to) REFERENCES Users(id),
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE TABLE Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    bg_color VARCHAR(7), -- Hex color code for background color
    text_color VARCHAR(7) -- Hex color code for text color
);

CREATE TABLE TaskTags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES Tasks(id),
    FOREIGN KEY (tag_id) REFERENCES Tags(id)
);


CREATE TABLE Activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    org_id INT,
    board_id INT,
    card_id INT, -- To track which card is affected
    task_id INT, -- To track which task is affected
    action VARCHAR(255), -- Stores actions like create, update, delete, move
    details TEXT, -- To store any additional details (e.g., task title, what was changed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id), 
    FOREIGN KEY (org_id) REFERENCES Organizations(id),
    FOREIGN KEY (board_id) REFERENCES Boards(id),
    FOREIGN KEY (card_id) REFERENCES Cards(id),
    FOREIGN KEY (task_id) REFERENCES Tasks(id)
);

CREATE VIEW user_profile_view AS
SELECT id, name, email, profile_pic
FROM Users;


-- Triggers --

-- Trigger for inserting into tasks
CREATE TRIGGER task_insert AFTER INSERT ON Tasks
FOR EACH ROW
BEGIN
    INSERT INTO Activity (user_id, org_id, board_id, card_id, task_id, action, details)
    VALUES (NEW.created_by, NEW.org_id, NULL, NEW.card_id, NEW.id, 'create', CONCAT('Task "', NEW.title, '" created.'));
END;

-- Trigger for updating tasks
CREATE TRIGGER task_update AFTER UPDATE ON Tasks
FOR EACH ROW
BEGIN
    INSERT INTO Activity (user_id, org_id, board_id, card_id, task_id, action, details)
    VALUES (NEW.created_by, NEW.org_id, NULL, NEW.card_id, NEW.id, 'update', CONCAT('Task "', NEW.title, '" updated.'));
END;


-- Trigger for deleting tasks
CREATE TRIGGER task_delete AFTER DELETE ON Tasks
FOR EACH ROW
BEGIN
    INSERT INTO Activity (user_id, org_id, board_id, card_id, task_id, action, details)
    VALUES (OLD.created_by, OLD.org_id, NULL, OLD.card_id, OLD.id, 'delete', CONCAT('Task "', OLD.title, '" deleted.'));
END;


-- Trigger for inserting into boards
CREATE TRIGGER board_insert AFTER INSERT ON Boards
FOR EACH ROW
BEGIN
    INSERT INTO Activity (user_id, org_id, board_id, card_id, task_id, action, details)
    VALUES (NEW.created_by, NEW.organization_id, NEW.id, NULL, NULL, 'create', CONCAT('Board "', NEW.name, '" created.'));
END;

-- Trigger for updating boards
CREATE TRIGGER board_update AFTER UPDATE ON Boards
FOR EACH ROW
BEGIN
    INSERT INTO Activity (user_id, org_id, board_id, card_id, task_id, action, details)
    VALUES (NEW.created_by, NEW.organization_id, NEW.id, NULL, NULL, 'update', CONCAT('Board "', NEW.name, '" updated.'));
END;

-- Trigger for deleting boards
CREATE TRIGGER board_delete AFTER DELETE ON Boards
FOR EACH ROW
BEGIN
    INSERT INTO Activity (user_id, org_id, board_id, card_id, task_id, action, details)
    VALUES (OLD.created_by, OLD.organization_id, OLD.id, NULL, NULL, 'delete', CONCAT('Board "', OLD.name, '" deleted.'));
END;


-- Trigger for automatic cards creation for board

CREATE TRIGGER create_default_cards_after_board_insert
AFTER INSERT ON Boards
FOR EACH ROW
BEGIN
    -- Insert default cards when a new board is created
    INSERT INTO Cards (name, board_id, created_by)
    VALUES ('todo', NEW.id, NEW.created_by),
           ('doing', NEW.id, NEW.created_by),
           ('completed', NEW.id, NEW.created_by);
END;



-- Procedures
CREATE PROCEDURE GetUsersByOrganization(IN org_id INT)
BEGIN
    SELECT u.id, u.name, u.email, u.profile_pic
    FROM Users u
    JOIN UserOrganizations uo ON u.id = uo.user_id
    WHERE uo.organization_id = org_id;
END;




CREATE PROCEDURE GetTaskActionCounts(IN orgId INT)
BEGIN
    SELECT 
        a.action, 
        COUNT(*) AS action_count
    FROM Activity a
    JOIN Tasks t ON a.task_id = t.id
    WHERE t.org_id = orgId
    GROUP BY a.action;
END;




CREATE PROCEDURE GetTasksByCard(IN organizationId INT)
BEGIN
    SELECT 
        c.id AS card_id, 
        c.name AS card_name,
        COUNT(t.id) AS total_tasks
    FROM Cards c
    LEFT JOIN Tasks t ON c.id = t.card_id
    LEFT JOIN Boards b ON c.board_id = b.id
    WHERE b.organization_id = organizationId
    GROUP BY c.id;
END;










