**Project Objective and Concept**

The workshop focuses on the development of a digital information system designed to support rehabilitation processes in the healthcare domain. Currently, rehabilitation is often managed through verbal instructions provided by professionals, without a centralized system for managing exercises, tracking performance, or providing accessible professional information to patients.

This situation creates several challenges, including difficulty in monitoring patient progress, lack of consistency in performing exercises, limited access to reliable information, and poor communication between the different professionals involved in the rehabilitation process. 

As part of the workshop, a web-based system will be developed that enables physiotherapists and fitness trainers to create visit summaries and design personalized treatment or training plans. Based on these plans, patients will be able to report on exercise performance, track their progress, and receive professional information through an AI-powered search engine using natural language queries. In addition, professionals will be able to validate and mark reliable content within the system.

The system integrates modern web technologies and external services, creating a unified platform for all stakeholders. The primary users of the system include physiotherapists, rehabilitation fitness trainers, and patients.

---

**Process 1 – Exercise Performance Reporting Management**
In this process, the patient reports on the exercises assigned as part of the rehabilitation plan. The patient can enter execution status, pain level, effort level, and additional notes. The system stores the data and allows updating, viewing, and deleting reports. This information is used by professionals to monitor adherence and progress throughout the rehabilitation process.

In addition, users can create reminders for performing exercises directly from the system. For this purpose, the system integrates with an external calendar service.

**Integration with external system:** Calendar API (e.g., Google Calendar) for creating exercise reminders.

---

**Process 2 – Query and Content Management in an AI-Based Search Engine (Gemini AI)**
In this process, users can submit queries in natural language and receive professional information about injuries, general rehabilitation topics, and rehabilitation exercises through an external AI engine.

Additionally, users can save executed queries, store relevant content, and mark content as recommended. The system allows creating, updating, viewing, and deleting queries and saved content.

**Integration with external system:** The system integrates with the Google Gemini AI API for processing natural language queries.

---

**Process 3 – Visit Summaries and Treatment/Training Plan Management**
In this process, a professional (physiotherapist or rehabilitation fitness trainer) documents the meeting with the patient and updates the rehabilitation or training plan according to the patient’s progress.

The professional creates a visit summary, and based on it, can create or update a treatment or training plan for the patient, including the specific exercises the patient needs to perform.

The system allows creating, updating, viewing, and deleting visit summaries and treatment plans. The information is stored in the database and is used by both the patient and professionals to track progress throughout the rehabilitation process.


**MVP Scope Clarification**
The MVP developed in this project represents only a subset of a broader system that was fully analyzed and designed, including detailed mockups.

As part of the scope reduction for the MVP, the chat functionality between patients and professionals will not be implemented. Therefore, any references to this feature in the system specification and design documents should be disregarded.