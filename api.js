const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");

let notes = [];

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
}

function setStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

function renderNotes() {
    notesList.textContent = "";

    if (notes.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";
        emptyItem.textContent = "No notes to display yet.";
        notesList.appendChild(emptyItem);
        return;
    }

    notes.forEach((note) => {
        const item = document.createElement("li");
        item.className = "note-card";

        const title = document.createElement("h3");
        title.textContent = note.title;

        const body = document.createElement("p");
        body.textContent = note.body || "";

        item.appendChild(title);
        item.appendChild(body);
        notesList.appendChild(item);
    });
}

async function loadNotes() {
    loadButton.disabled = true;
    setStatus("Loading notes...", "loading");

    try {
        const response = await request(`${API_URL}?_limit=10`);
        notes = await response.json();

        renderNotes();

        if (notes.length === 0) {
            setStatus("The server returned no notes.", "success");
        } else {
            setStatus(
                `Loaded ${notes.length} notes from the server.`,
                "success"
            );
        }
    } catch (error) {
        setStatus(
            "Unable to load notes. Please check your connection and try again.",
            "error"
        );

        notesList.textContent = "";
        const errorItem = document.createElement("li");
        errorItem.className = "empty-state";
        errorItem.textContent = "Notes could not be loaded.";
        notesList.appendChild(errorItem);
    } finally {
        loadButton.disabled = false;
    }
}

async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        setStatus("Please enter a note title.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        setStatus("The title must be 100 characters or fewer.", "error");
        titleInput.focus();
        return;
    }

    submitButton.disabled = true;
    setStatus("Creating note...", "loading");

    try {
        const response = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        const newNote = await response.json();

        // JSONPlaceholder simulates creation; it does not permanently
        // save the new note. Keep it in local memory for this page session.
        notes.unshift(newNote);
        renderNotes();

        setStatus(
            `Note created (status ${response.status}, id ${newNote.id}).`,
            "success"
        );

        noteForm.reset();
    } catch (error) {
        setStatus(
            "Unable to create the note. Please try again.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
    }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

