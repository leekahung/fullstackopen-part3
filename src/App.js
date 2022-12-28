import { useEffect, useState } from "react";
import noteServices from "./services/notes";
import Header from "./components/Header";
import Notes from "./components/Notes";
import ShowNoteButton from "./components/ShowNoteButton";
import NotesForm from "./components/NotesForm";
import Footer from "./components/Footer";
import loginService from "./services/login";
import Login from "./components/Login";
import Toggable from "./components/Toggable";
import Logout from "./components/Logout";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [showAll, setShowAll] = useState(true);
  const [notification, setNotification] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    noteServices.getAll().then((returnedNotes) => {
      setNotes(returnedNotes);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      noteServices.setToken(user.token);
    }
  }, []);

  const notesToShow = showAll ? notes : notes.filter((n) => n.important);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  const setNotificationMessage = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const toggleNoteImportance = async (id) => {
    const note = notes.find((n) => n.id === id);
    const updateNote = { ...note, important: !note.important };

    try {
      const updatedNote = await noteServices.update(id, updateNote);
      setNotes(notes.map((n) => (n.id !== id ? n : updatedNote)));
      setNotificationMessage("Note updated");
    } catch (exception) {
      setNotificationMessage("Note cannot be updated");
    }
  };

  const handleAddNote = async (noteObject) => {
    try {
      const savedNote = await noteServices.create(noteObject);
      setNotes(notes.concat(savedNote));
      setNotificationMessage("New note added");
    } catch (exception) {
      setNotificationMessage(
        "Note content missing or shorter than 5 characters long"
      );
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await noteServices.remove(id);
      setNotes(notes.filter((n) => n.id !== id));
      setNotificationMessage("Note deleted");
    } catch (exception) {
      setNotificationMessage("Note cannot be deleted");
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const user = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));

      noteServices.setToken(user.token);
      setUser(user);
      setNotificationMessage(`${user.name} logged in`);
    } catch (exception) {
      setNotificationMessage("Wrong credentials");
    }
  };

  return (
    <div className="App">
      <Header />
      <div>{notification}</div>
      {user === null ? (
        <Toggable buttonLabel="login">
          <Login handleLogin={handleLogin} />
        </Toggable>
      ) : (
        <>
          <Toggable buttonLabel="new note">
            <NotesForm handleAddNote={handleAddNote} />
          </Toggable>
          <Logout setNotification={setNotification} />
        </>
      )}
      <ShowNoteButton handleShowAll={handleShowAll} showAll={showAll} />
      <Notes
        notes={notesToShow}
        toggleNoteImportance={toggleNoteImportance}
        handleDeleteNote={handleDeleteNote}
      />
      <Footer />
    </div>
  );
};

export default App;
