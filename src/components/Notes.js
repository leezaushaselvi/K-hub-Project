import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { authTokens, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await axios.get("http://localhost:8000/notes", {
        headers: { Authorization: `Bearer ${authTokens.access_token}` }
      });
      setNotes(response.data);
    };

    fetchNotes();
  }, [authTokens]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/notes", { title, content }, {
        headers: { Authorization: `Bearer ${authTokens.access_token}` }
      });
      setNotes([...notes, response.data]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("There was an error creating the note!", error);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`http://localhost:8000/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${authTokens.access_token}` }
      });
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error("There was an error deleting the note!", error);
    }
  };

  return (
    <div>
      <h2>Notes</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
        <button type="submit">Add Note</button>
      </form>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => handleDelete(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Notes;
