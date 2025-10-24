# Recruitment Management System

## Overview

A Node.js + Express.js + MongoDB based backend for managing recruitment workflows.
It allows Applicants to upload resumes and apply for jobs, and Admins to create and manage job openings while viewing extracted resume data using a third-party Resume Parsing API..

## Tech-Stack
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT (JSON Web Tokens)
- Uploading : Multer
- Password Hashing : bcrypt

## Features

### User Management

- Users can sign up as either Admin or Applicant.

- Users can log in using JWT-based authentication.

- Applicants can upload resumes (.pdf or .docx only).

### Resume Processing

- Uploaded resumes are sent to the APILayer Resume Parser API.

- Extracted data such as Skills, Education, Experience, Name, Email, and Phone are saved in the database.

### Job Management

- Admins can:

  - Create job openings.

  - View all applicants and their extracted details.

  - Fetch details of any job with its list of applicants.

- Applicants can:

  - View all job openings.
  - Apply to specific job openings.


## Prerequisites

Before setting up the application, ensure you have the following installed:

- Node.js (v18+ recommended)
- MongoDB (or use the MongoDB container)

## Installation

1. Clone the Repository:

```bash
git clone https://github.com/Vipul-Vermaa/Synlabs
cd Synlabs
```
2. Install Dependencies:
```bash
npm install
```
3. Set Up Environment Variables(by creating .env file in root directory):
```bash
MONGO_URI=YOUR_MONGO_URI
PORT=4000
JWT_SECRET=your_secret_key
```
4. Run the application
- Locally
```
npm start
```

