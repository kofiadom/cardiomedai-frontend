# CardioMed AI Backend API Documentation

## Base Information
- **Base URL**: `https://cardiomedai-api.onrender.com` (your hosted backend)
- **API Framework**: FastAPI
- **Authentication**: None required (open API)
- **CORS**: Enabled for all origins
- **Content-Type**: `application/json` (except for file uploads which use `multipart/form-data`)

## API Overview

The CardioMed AI backend provides comprehensive health management functionality including:
- User management and profiles
- Blood pressure readings with OCR support
- AI-powered health advisor (community health worker)
- Knowledge agent for hypertension Q&A
- Medication, BP check, doctor appointment, and workout reminders

---

## 🏠 Root Endpoint

### GET `/`
**Description**: API welcome message with endpoint overview
**Response**:
```json
{
  "message": "Welcome to the CardioMed AI API",
  "endpoints": { /* endpoint overview */ }
}
```

---

## 👥 User Management

### POST `/users/`
**Description**: Create a new user
**Request Body**:
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "full_name": "string",
  "age": 30,
  "gender": "string",
  "height": 175.5,
  "weight": 70.0,
  "medical_conditions": "string (optional)",
  "medications": "string (optional)"
}
```
**Response**: User object with `id` and all fields (password excluded)

### GET `/users/`
**Description**: List all users
**Query Parameters**:
- `skip`: int = 0 (pagination offset)
- `limit`: int = 100 (pagination limit)
**Response**: Array of user objects

### GET `/users/{user_id}`
**Description**: Get specific user by ID
**Response**: User object

### PUT `/users/{user_id}`
**Description**: Update user information
**Request Body**: Any subset of user fields (all optional)
**Response**: Updated user object

---

## 🩺 Blood Pressure Management

### POST `/bp/readings/`
**Description**: Create a new blood pressure reading manually
**Query Parameters**:
- `user_id`: int (required)
**Request Body**:
```json
{
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "notes": "string (optional)",
  "device_id": "string (optional)",
  "interpretation": "string (optional)"
}
```
**Validation**:
- Systolic: 70-250
- Diastolic: 40-150
- Pulse: 30-220
**Response**: Blood pressure reading object with auto-generated interpretation

### GET `/bp/readings/{user_id}`
**Description**: Get all blood pressure readings for a user
**Query Parameters**:
- `skip`: int = 0
- `limit`: int = 100
**Response**: Array of blood pressure readings (newest first)

### POST `/bp/upload/`
**Description**: Upload blood pressure monitor image for OCR processing
**Content-Type**: `multipart/form-data`
**Form Data**:
- `user_id`: int
- `image`: file (image file)
- `notes`: string (optional)
**Response**: Blood pressure reading object with OCR-extracted values

### POST `/bp/save-ocr/`
**Description**: Save OCR reading data after user approval
**Request Body**:
```json
{
  "user_id": 1,
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "notes": "string (optional)",
  "device_id": "string",
  "interpretation": "string"
}
```
**Response**: Saved blood pressure reading object

---

## 🤖 Health Advisor (Community Health Worker)

### POST `/health-advisor/advice`
**Description**: Get personalized health advice from AI community health worker
**Request Body**:
```json
{
  "user_id": 1,
  "message": "Good morning! How am I doing with my blood pressure this week?"
}
```
**Response**:
```json
{
  "user_id": 1,
  "request_message": "string",
  "advisor_response": "string (friendly, encouraging message with emojis)",
  "agent_id": "string",
  "thread_id": "string",
  "status": "completed"
}
```

### GET `/health-advisor/advice/{user_id}`
**Description**: Quick daily check-in (GET version)
**Query Parameters**:
- `message`: string (optional, defaults to morning check-in)
**Response**: Same as POST version

### GET `/health-advisor/status`
**Description**: Check health advisor service status
**Response**: Service status and configuration info

---

## 🧠 Knowledge Agent (Hypertension Q&A)

### POST `/knowledge-agent/ask`
**Description**: Ask hypertension-related questions with RAG-powered responses
**Request Body**:
```json
{
  "user_id": 1,
  "question": "What are the different stages of hypertension?",
  "include_user_context": false
}
```
**Response**:
```json
{
  "question": "string",
  "answer": "string (evidence-based response)",
  "sources": ["string array of source files"],
  "user_id": 1,
  "agent_id": "string",
  "thread_id": "string",
  "vector_store_id": "string",
  "status": "completed"
}
```

### GET `/knowledge-agent/ask/{question}`
**Description**: Simple GET version for asking questions
**Query Parameters**:
- `user_id`: int (optional)
- `include_user_context`: bool = false
**Response**: Same as POST version

### POST `/knowledge-agent/upload-knowledge`
**Description**: Upload new knowledge base files
**Content-Type**: `multipart/form-data`
**Form Data**:
- `file`: file (PDF, TXT, DOCX, MD, HTML, JSON)
- `description`: string
- `auto_add_to_vector_store`: bool = true
**File Limits**: 512MB max, supported formats: PDF, TXT, DOCX, MD, HTML, JSON, DOC, PPTX

### GET `/knowledge-agent/status`
**Description**: Check knowledge agent service status

---

## 💊 Medication Reminders

### POST `/reminders/`
**Description**: Create medication reminder manually
**Query Parameters**:
- `user_id`: int
**Request Body**:
```json
{
  "name": "Lisinopril",
  "dosage": "10mg",
  "schedule_datetime": "2024-01-15T08:00:00",
  "schedule_dosage": "1 tablet",
  "notes": "string (optional)"
}
```

### GET `/reminders/{user_id}`
**Description**: Get user's medication reminders
**Query Parameters**:
- `skip`: int = 0
- `limit`: int = 100
- `include_taken`: bool = true

### GET `/reminders/reminder/{reminder_id}`
**Description**: Get specific medication reminder

### PUT `/reminders/reminder/{reminder_id}`
**Description**: Update medication reminder
**Request Body**: Any subset of reminder fields

### DELETE `/reminders/reminder/{reminder_id}`
**Description**: Delete medication reminder

### POST `/reminders/upload-prescription`
**Description**: Upload prescription image for OCR extraction
**Content-Type**: `multipart/form-data`
**Form Data**:
- `user_id`: int
- `image`: file
- `notes`: string (optional)
**Response**:
```json
{
  "extracted_data": {
    "name": "string",
    "dosage": "string",
    "schedule": [
      {
        "datetime": "2024-01-15T08:00:00",
        "dosage": "string"
      }
    ],
    "interpretation": "string (AI explanation)"
  },
  "total_reminders": 3,
  "message": "string"
}
```

### POST `/reminders/save-ocr-reminders`
**Description**: Save OCR-extracted reminders after user approval
**Request Body**:
```json
{
  "user_id": 1,
  "extracted_data": { /* same as extracted_data above */ },
  "notes": "string (optional)"
}
```

### POST `/reminders/mark-taken/{reminder_id}`
**Description**: Mark medication reminder as taken

### GET `/reminders/upcoming/{user_id}`
**Description**: Get upcoming medication reminders
**Query Parameters**:
- `hours`: int = 24 (look-ahead window)

---

## 🩺 Blood Pressure Check Reminders

### POST `/reminders/bp-reminder/`
**Description**: Create BP check reminder manually
**Query Parameters**:
- `user_id`: int
**Request Body**:
```json
{
  "reminder_datetime": "2024-01-15T08:00:00",
  "bp_category": "manual",
  "notes": "string (optional)"
}
```

### GET `/reminders/bp-reminder/{reminder_id}`
**Description**: Get specific BP check reminder

### PUT `/reminders/bp-reminder/{reminder_id}`
**Description**: Update BP check reminder

### DELETE `/reminders/bp-reminder/{reminder_id}`
**Description**: Delete BP check reminder

### POST `/reminders/bp-schedule`
**Description**: Generate automated BP check schedule based on clinical guidelines
**Request Body**:
```json
{
  "user_id": 1,
  "systolic": 140,
  "diastolic": 90,
  "first_check_time": "2024-01-15T08:00:00",
  "preferred_morning_time": "07:00",
  "preferred_evening_time": "19:00"
}
```
**Response**:
```json
{
  "category": "Stage 1 Hypertension",
  "category_description": "string",
  "total_reminders": 7,
  "advice": "string",
  "reminders": [/* array of BP check reminders */]
}
```

### GET `/reminders/bp-reminders/{user_id}`
**Description**: Get user's BP check reminders
**Query Parameters**:
- `skip`: int = 0
- `limit`: int = 100
- `include_completed`: bool = true

### POST `/reminders/bp-reminder/{reminder_id}/complete`
**Description**: Mark BP check reminder as completed

### GET `/reminders/bp-upcoming/{user_id}`
**Description**: Get upcoming BP check reminders
**Query Parameters**:
- `hours`: int = 24

### POST `/reminders/bp-preview`
**Description**: Preview BP reminder schedule without saving
**Request Body**: Same as `/bp-schedule`
**Response**: Same as `/bp-schedule` but doesn't save to database

---

## 👨‍⚕️ Doctor Appointment Reminders

### POST `/reminders/doctor-appointment/`
**Description**: Create doctor appointment reminder
**Query Parameters**:
- `user_id`: int
**Request Body**:
```json
{
  "appointment_datetime": "2024-01-15T14:00:00",
  "doctor_name": "Dr. Smith",
  "appointment_type": "Cardiology Checkup",
  "location": "Medical Center",
  "notes": "string (optional)"
}
```

### GET `/reminders/doctor-appointments/{user_id}`
**Description**: Get user's doctor appointments
**Query Parameters**:
- `skip`: int = 0
- `limit`: int = 100
- `include_completed`: bool = true

### GET `/reminders/doctor-appointment/{reminder_id}`
**Description**: Get specific doctor appointment

### PUT `/reminders/doctor-appointment/{reminder_id}`
**Description**: Update doctor appointment

### DELETE `/reminders/doctor-appointment/{reminder_id}`
**Description**: Delete doctor appointment

### POST `/reminders/doctor-appointment/{reminder_id}/complete`
**Description**: Mark doctor appointment as completed

---

## 🏃‍♂️ Workout Reminders

### POST `/reminders/workout/`
**Description**: Create workout reminder
**Query Parameters**:
- `user_id`: int
**Request Body**:
```json
{
  "workout_datetime": "2024-01-15T06:00:00",
  "workout_type": "Cardio",
  "duration_minutes": 30,
  "location": "Gym",
  "notes": "string (optional)"
}
```

### GET `/reminders/workouts/{user_id}`
**Description**: Get user's workout reminders
**Query Parameters**:
- `skip`: int = 0
- `limit`: int = 100
- `include_completed`: bool = true

### GET `/reminders/workout/{reminder_id}`
**Description**: Get specific workout reminder

### PUT `/reminders/workout/{reminder_id}`
**Description**: Update workout reminder

### DELETE `/reminders/workout/{reminder_id}`
**Description**: Delete workout reminder

### POST `/reminders/workout/{reminder_id}/complete`
**Description**: Mark workout as completed

---

## 📊 Common Response Formats

### User Object
```json
{
  "id": 1,
  "username": "string",
  "email": "user@example.com",
  "full_name": "string",
  "age": 30,
  "gender": "string",
  "height": 175.5,
  "weight": 70.0,
  "medical_conditions": "string",
  "medications": "string"
}
```

### Blood Pressure Reading Object
```json
{
  "id": 1,
  "user_id": 1,
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "notes": "string",
  "device_id": "string",
  "interpretation": "Normal blood pressure",
  "reading_time": "2024-01-15T08:00:00"
}
```

### Error Response
```json
{
  "detail": "Error message description"
}
```

---

## 🔧 Implementation Notes

### File Uploads
- Use `FormData` for file uploads
- Supported image formats: JPG, PNG, GIF, BMP, TIFF
- Supported document formats: PDF, TXT, DOCX, MD, HTML, JSON, DOC, PPTX
- Maximum file size: 512MB

### Date/Time Format
- Use ISO 8601 format: `"2024-01-15T08:00:00"`
- All times are in UTC

### Pagination
- Most list endpoints support `skip` and `limit` parameters
- Default limit is usually 100

### Error Handling
- HTTP 400: Bad Request (validation errors)
- HTTP 404: Not Found (user/resource not found)
- HTTP 413: Payload Too Large (file size exceeded)
- HTTP 500: Internal Server Error

### CORS
- All origins allowed
- All methods allowed
- No authentication required

### Blood Pressure Categories
The API automatically categorizes blood pressure readings according to clinical guidelines:
- **Normal**: Systolic < 120 AND Diastolic < 80
- **Elevated**: Systolic 120-129 AND Diastolic < 80
- **Stage 1 Hypertension**: Systolic 130-139 OR Diastolic 80-89
- **Stage 2 Hypertension**: Systolic ≥ 140 OR Diastolic ≥ 90
- **Hypertensive Crisis**: Systolic > 180 OR Diastolic > 120

### OCR Features
- **Blood Pressure OCR**: Extracts systolic, diastolic, and pulse from BP monitor images
- **Medication OCR**: Extracts medication name, dosage, and schedule from prescription images
- **User Approval Required**: OCR data must be approved by user before saving to database
- **AI Interpretation**: Provides explanation of what was extracted and how

### AI Agent Features
- **Health Advisor**: Provides friendly, personalized daily check-ins with emojis and encouragement
- **Knowledge Agent**: Uses RAG (Retrieval-Augmented Generation) for evidence-based hypertension information
- **Database Integration**: Both agents can access user's blood pressure data for personalized responses
- **File Search**: Knowledge agent searches through uploaded medical literature and guidelines

This API provides comprehensive health management functionality with AI-powered features for blood pressure monitoring, medication management, and health education. The OCR capabilities allow users to easily capture data from images, while the AI agents provide personalized advice and evidence-based information.
