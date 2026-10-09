# QuickNotes System Design

## Project Overview

QuickNotes is a simple notes management application that demonstrates how a frontend communicates with a REST API. Users can load notes from a server, create new notes, and view the notes displayed in the application.

The project uses HTML, CSS, and JavaScript, with JSONPlaceholder as a demonstration API.

**Note:** JSONPlaceholder simulates creating and deleting records. Changes made through POST and DELETE requests are not permanently saved on its server.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Fetch API and async/await)
- REST API
- JSONPlaceholder
- Git and GitHub

## Getting Started

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` in your browser, or use the Live Server extension.
4. Click **Load notes** to retrieve sample notes.
5. Enter a title and optional body, then submit the form to create a note.

An internet connection is required to communicate with JSONPlaceholder.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Documentation

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [System Architecture](docs/architecture.md)

## What I Learned

- How to use HTTP methods such as GET, POST, and DELETE when communicating with a REST API.
- How to handle asynchronous requests, responses, and errors with JavaScript.
- How to document API endpoints, database relationships, and system architecture.
- How to use Git commits to track project development.

## Limitations

This is a learning project using a public demonstration API. It does not include user authentication or a permanent backend database. A production version would require a backend service, persistent storage, and appropriate security controls.