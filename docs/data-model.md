# QuickNotes Data Model

## 1. Overview

QuickNotes requires a database to store users, notes, and note tags. This design uses SQLite-compatible SQL and defines the relationships between the tables.

The current frontend uses JSONPlaceholder, so these tables describe the proposed persistent database for a future QuickNotes backend.

## 2. Database Tables

### Users

Stores information about registered users.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | Primary key | Unique user identifier |
| name | TEXT | NOT NULL | User's display name |
| email | TEXT | NOT NULL, UNIQUE | User's email address |
| created_at | TEXT | NOT NULL | Account creation timestamp |

### Notes

Stores notes created by users.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | Primary key | Unique note identifier |
| user_id | INTEGER | Foreign key, NOT NULL | User who owns the note |
| title | TEXT | NOT NULL | Note title |
| body | TEXT | Nullable | Note content |
| created_at | TEXT | NOT NULL | Creation timestamp |
| updated_at | TEXT | NOT NULL | Last update timestamp |

### Tags

Stores labels that users can associate with notes.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | Primary key | Unique tag identifier |
| name | TEXT | NOT NULL, UNIQUE | Tag name |

### Note_Tags

Connects notes with tags. This junction table supports a many-to-many relationship.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| note_id | INTEGER | Foreign key, NOT NULL | Related note |
| tag_id | INTEGER | Foreign key, NOT NULL | Related tag |

The combination of `note_id` and `tag_id` forms the composite primary key, preventing the same tag from being assigned to the same note more than once.

## 3. Relationships

- **Users to Notes:** One-to-many. A user can own many notes, but each note belongs to one user.
- **Notes to Tags:** Many-to-many. A note can have several tags, and a tag can be assigned to several notes.
- **Notes to Note_Tags:** One-to-many. Each note can have multiple rows in the junction table.
- **Tags to Note_Tags:** One-to-many. Each tag can appear in multiple junction-table rows.

## 4. Entity Relationship Diagram

```text
USERS
-----
id (PK)
name
email
created_at
  |
  | one-to-many
  v
NOTES
-----
id (PK)
user_id (FK)
title
body
created_at
updated_at
  |
  | one-to-many
  v
NOTE_TAGS
---------
note_id (PK, FK)
tag_id  (PK, FK)
  ^
  | many-to-one
  |
TAGS
----
id (PK)
name
```

The diagram shows how the junction table connects notes and tags.

## 5. SQL Table Definitions

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    body TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
```

Foreign-key enforcement is enabled using `PRAGMA foreign_keys = ON`. In SQLite, this setting should be enabled for each database connection.

The index on `notes.user_id` helps retrieve a user's notes. The index on `note_tags.tag_id` helps find notes associated with a particular tag.

## 6. Sample SQL Queries

### Query 1: Retrieve all notes belonging to a user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

This query retrieves notes for one user, showing the most recently updated notes first.

### Query 2: Retrieve notes with their owners

```sql
SELECT
    notes.id,
    notes.title,
    users.name AS owner_name
FROM notes
JOIN users ON notes.user_id = users.id
ORDER BY notes.created_at DESC;
```

This query uses an INNER JOIN to combine notes with their owners' information.

### Query 3: Find notes associated with a particular tag

```sql
SELECT
    notes.id,
    notes.title,
    tags.name AS tag_name
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE tags.name = 'school';
```

This query joins three tables to retrieve notes assigned the `school` tag.

### Query 4: Count notes per user

```sql
SELECT
    users.id,
    users.name,
    COUNT(notes.id) AS total_notes
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name
ORDER BY total_notes DESC;
```

The LEFT JOIN includes users who have not created any notes.

## 7. Data Integrity

The database design uses the following rules:

- Primary keys uniquely identify records.
- Foreign keys enforce relationships between tables.
- The unique constraint prevents duplicate email addresses and tag names.
- The title check prevents empty or whitespace-only note titles.
- The composite primary key in `note_tags` prevents duplicate note-tag assignments.
- `ON DELETE CASCADE` removes a user's notes when the user is deleted and removes associated note-tag links when notes or tags are deleted.

A production system should also validate input in the backend and enforce authentication and authorization before allowing users to access or change records.

## 8. SQL vs. NoSQL

### Why SQL is suitable

A relational database such as SQLite or PostgreSQL is suitable because QuickNotes has clearly defined entities and relationships. Foreign keys and transactions help maintain data integrity. SQL joins also make it straightforward to retrieve notes together with their owners and tags.

### When NoSQL might be useful

A document database such as MongoDB could be appropriate if note structures varied significantly or the application needed to store flexible nested documents. However, relationships between users, notes, and tags would still need careful design.

### Decision

SQL is the preferred choice for this project because its structured data, relationships, constraints, and query requirements fit a relational database well.