CREATE DATABASE IF NOT EXISTS `rehab360`;
USE `rehab360`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('PATIENT', 'THERAPIST') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `users` (`name`, `email`, `password`, `role`) 
VALUES 
    ('Shani', 'shani@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'PATIENT'),
    ('Liron', 'liron@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'PATIENT'),
    ('Elran', 'elran@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'THERAPIST'),
    ('Yogev', 'yogev@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'THERAPIST');




CREATE TABLE RegisteredUsers (
    UserID VARCHAR(255),
    UserRole VARCHAR(255),
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    BirthDate DATE  NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255),
    LicenseNumber VARCHAR(50), 
    PRIMARY KEY (UserID, UserRole)
);

CREATE TABLE Exercises (
    ExerciseID INT PRIMARY KEY,
    ExerciseName VARCHAR(255) NOT NULL,
    DifficultyLevel INT NOT NULL,
    TreatmentArea VARCHAR(100) NOT NULL,
    EXVideoURL VARCHAR(255) NOT NULL,
    TextInstructions TEXT NOT NULL
);

CREATE TABLE Sessions (
    SessionID INT PRIMARY KEY,
    VisitDate DATE NOT NULL,
    VisitTime TIME NOT NULL,
    VisitType VARCHAR(50) NOT NULL,
    TreatmentArea VARCHAR(100) NOT NULL,
    MedicalDiagnosis TEXT NOT NULL,
    Description TEXT NOT NULL,
    Recommendations  TEXT,
    PatientID VARCHAR(20),
    PatientRole VARCHAR(50),
    TherapistID VARCHAR(20),
    TherapistRole VARCHAR(50),
    FOREIGN KEY (PatientID, PatientRole) REFERENCES RegisteredUsers(UserID, UserRole),
    FOREIGN KEY (TherapistID, TherapistRole) REFERENCES RegisteredUsers(UserID, UserRole)
);

CREATE TABLE Plans (
    PlanID INT PRIMARY KEY,
    Goal TEXT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    SessionID INT,
    FOREIGN KEY (SessionID) REFERENCES Sessions(SessionID)
);

CREATE TABLE PlanExercises (
    PlanID INT,
    SessionID INT,
    ExerciseID INT,
    Reps INT NOT NULL,
    Sets INT NOT NULL,
    Weight FLOAT NOT NULL,
    TimeDuration INT NOT NULL,
    TimeUnit VARCHAR(30) NOT NULL,
    Description TEXT,
    PRIMARY KEY (PlanID, SessionID, ExerciseID),
    FOREIGN KEY (PlanID) REFERENCES Plans(PlanID),
    FOREIGN KEY (SessionID) REFERENCES Sessions(SessionID),
    FOREIGN KEY (ExerciseID) REFERENCES Exercises(ExerciseID)
);

CREATE TABLE WeeklyPlans (
    WeeklyPlanID INT,
    PlanID INT,
    SessionID INT,
    ExerciseID INT,
    ReminderTime DATETIME NOT NULL,
    notificationEnabled BOOLEAN,
    PRIMARY KEY (WeeklyPlanID, PlanID, SessionID, ExerciseID),
    FOREIGN KEY (PlanID, SessionID, ExerciseID) REFERENCES PlanExercises(PlanID, SessionID, ExerciseID)
);

CREATE TABLE ExerciseExecutionLog (
    LogID INT PRIMARY KEY,
    WeeklyPlanID INT,
    PlanID INT,
    SessionID INT,
    ExerciseID INT,
    ExecutionDate DATE NOT NULL,
    ExecutionStatus BOOLEAN NOT NULL,
    ReasonForNonPerformance TEXT,
    PainLevel INT Not NULL,
    EffortLevel INT NOT NULL,
    RequestForChange TEXT,
    FOREIGN KEY (WeeklyPlanID, PlanID, SessionID, ExerciseID) 
        REFERENCES WeeklyPlans(WeeklyPlanID, PlanID, SessionID, ExerciseID)
);

-- 8. טבלת שאילתא
CREATE TABLE Queries (
    QueryID INT PRIMARY KEY,
    QueryText TEXT NOT NULL,
    QueryDate DATE NOT NULL,
    UserID VARCHAR(20),
    UserRole VARCHAR(50),
    FOREIGN KEY (UserID, UserRole) REFERENCES RegisteredUsers(UserID, UserRole)
);

-- 9. טבלת תוכן
CREATE TABLE Content (
    ContentID INT PRIMARY KEY,
    ContentType VARCHAR(50) NOT NULL,
    ContentTitle VARCHAR(255) NOT NULL,
    ContentSourceLink VARCHAR(255) NOT NULL,
    QueryID INT,
    FOREIGN KEY (QueryID) REFERENCES Queries(QueryID)
);

-- 10. טבלת תוכן מומלץ
CREATE TABLE RecommendedContent (
    RecommendedID INT PRIMARY KEY,
    RecommendationDate DATE NOT NULL,
    ContentID INT,
    UserID VARCHAR(20),
    UserRole VARCHAR(50),
    FOREIGN KEY (ContentID) REFERENCES Content(ContentID),
    FOREIGN KEY (UserID, UserRole) REFERENCES RegisteredUsers(UserID, UserRole)
);


