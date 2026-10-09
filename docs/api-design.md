# QuickNotes API Design

## 1. Overview

QuickNotes uses a REST API to manage notes. The frontend sends HTTP requests to an API server and receives JSON responses.

The current application uses JSONPlaceholder for demonstration:

`https://jsonplaceholder.typicode.com/posts`

JSONPlaceholder is a testing API. It simulates creating, updating, and deleting records, but it does not permanently store those changes.

## 2. API Endpoints

The following endpoints describe the proposed API for a complete QuickNotes application.

| Method | Endpoint | Purpose | Success response |
|---|---|---|---|
| GET | `/api/notes` | Retrieve all notes | 200 OK |
| GET | `/api/notes/{id}` | Retrieve one note by ID | 200 OK |
| POST | `/api/notes` | Create a new note | 201 Created |
| PATCH | `/api/notes/{id}` | Update an existing note | 200 OK |
| DELETE | `/api/notes/{id}` | Delete a note | 204 No Content |
| GET | `/api/users/{userId}/notes` | Retrieve notes belonging to a user | 200 OK |

These routes are the proposed design for a future backend. They are not all implemented by the current JSONPlaceholder frontend.

## 3. Request and Response Examples

### GET /api/notes

Retrieves a list of notes.

Example response:

```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "Study REST APIs",
    "body": "Review HTTP methods and status codes."
  },
  {
    "id": 2,
    "userId": 1,
    "title": "Project tasks",
    "body": "Finish the system design documentation."
  }
]
```

### GET /api/notes/1

Retrieves a single note by its ID.

Example response:

```json
{
  "id": 1,
  "userId": 1,
  "title": "Study REST APIs",
  "body": "Review HTTP methods and status codes."
}
```

### POST /api/notes

Creates a new note. The client sends the note title and body as JSON.

Example request:

```json
{
  "userId": 1,
  "title": "My new note",
  "body": "Complete the QuickNotes project."
}
```

Example successful response:

```json
{
  "id": 101,
  "userId": 1,
  "title": "My new note",
  "body": "Complete the QuickNotes project."
}
```

A real backend should generate the note ID and return `201 Created`.

### PATCH /api/notes/1

Updates selected fields of an existing note.

Example request:

```json
{
  "title": "Updated note title"
}
```

Example response:

```json
{
  "id": 1,
  "userId": 1,
  "title": "Updated note title",
  "body": "Review HTTP methods and status codes."
}
```

### DELETE /api/notes/1

Deletes a note with ID 1.

Expected successful response:

```http
204 No Content
```

A `204` response has no response body.

### GET /api/users/1/notes

Retrieves all notes owned by user 1. The server should verify that the requesting user is authorized to access the requested notes.

Example response:

```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "Study REST APIs",
    "body": "Review HTTP methods and status codes."
  }
]
```

## 4. HTTP Status Codes and Error Handling

| Status code | Meaning | Example situation |
|---|---|---|
| 200 OK | Request completed successfully | Notes retrieved or updated |
| 201 Created | A resource was created | A new note was saved |
| 204 No Content | Request succeeded without a response body | A note was deleted |
| 400 Bad Request | Request data is invalid | A required title is missing |
| 401 Unauthorized | Authentication is required or invalid | User is not authenticated |
| 403 Forbidden | User is not permitted to perform the action | User tries to delete another user's note |
| 404 Not Found | Resource does not exist | Requested note ID is missing |
| 500 Internal Server Error | Unexpected server failure | Database operation fails |

Example error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note title is required."
  }
}
```

The frontend should display a helpful message when a request fails rather than leaving the user uncertain about what happened.

## 5. Validation and Security

- A note must have a non-empty title.
- Titles must not exceed 100 characters.
- The server must validate request data even when the frontend performs validation.
- Authentication should identify the user making a request.
- Authorization must ensure users can only access or change notes they are permitted to manage.
- HTTPS should protect information sent between the browser and server.
- User-provided text should be handled safely to reduce cross-site scripting risks.
- Rate limiting should help prevent excessive or abusive requests.

## 6. Frontend Implementation

The current QuickNotes frontend uses JavaScript's Fetch API and `async/await` to send requests.

- `GET` loads sample notes.
- `POST` submits a new note.
- The interface displays loading, success, and error messages.
- Notes are rendered using DOM methods and `textContent`.

The current implementation uses JSONPlaceholder's `/posts` endpoint rather than the proposed `/api/notes` routes. The proposed routes would be implemented by a future QuickNotes backend.

## 7. Future Improvements

A future version could add user authentication, pagination, search, note categories, permanent database storage, and automated API tests.