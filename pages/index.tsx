import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Container, ThemeProvider, createTheme, Box, CssBaseline,
} from '@mui/material';
import { pink, indigo } from '@mui/material/colors';
import { zhCN } from '@mui/material/locale';

import Head from 'next/head';
import sessionService from '@/services/session';
import userService from '@/services/user';
import noteService from '@/services/note';
import {
  ErrorMessage, LoginUser, NewNote, NewUser, Note, SnackbarMessage, User,
} from '@/utils/types';
import { toErrorMessage, toUser } from '@/utils/utils';

import ApplicationBar from './components/ApplicationBar';
import Login from './components/Login';
import EditPassword from './components/EditPassword';
import Register from './components/Register';
import ErrorDialog from './components/ErrorDialog';
import NoteForm from './components/NoteForm';
import Notes from './components/Notes';
import NotificationSnackbar from './components/NotificationSnackbar';
import NewFab from './components/NewFab';

const theme = createTheme({
  palette: {
    primary: {
      main: indigo['500'],
      dark: indigo['700'],
    },
    secondary: { main: pink.A200 },
  },
  typography: {
    fontFamily: [
      'Noto Sans SC',
      'Noto Sans CJK SC',
      'Roboto',
      'Helvetica',
      'Arial',
    ].map((fontName) => `"${fontName}"`).concat('sans-serif').join(','),
  },
  shape: {
    borderRadius: 2,
  },
}, zhCN);

const UNDO_TIMEOUT = 5000;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [snackbarActionUndo, setSnackbarActionUndo] = useState<(() => any) | null>(null);

  const hideSnackbar = () => {
    setMessage(null);
    setSnackbarActionUndo(null);
  };

  const setSnackbar: SnackbarMessage = (content, actionUndo) => {
    setMessage(content);
    setSnackbarActionUndo(actionUndo);
  };

  const handleLogin = (credentials: LoginUser) => (
    sessionService.login(credentials)
      .then((u) => setUser(u))
  );

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionService.logout().then(() => {
      setUser(null);
    });
  };

  const handleRegister = (newUser: NewUser) => userService.create(newUser);
  const getActivateState = () => userService.get().then((u) => u.verified);
  const resendVerifyEmail = () => userService.sendVerifyEmail();

  const handleEditPassword = async (newPassword: string) => {
    if (!(user && user.email)) {
      // TODO: use constant instead of hard code
      throw new Error('User email is null');
    }

    return userService.patch({ ...user, password: newPassword });
  };

  const handleNoteCreate = (newNote: NewNote) => (
    noteService.create(newNote)
      .then((returnedNote) => setNotes(notes.concat(returnedNote)))
  );

  const handleNoteUpdate = (id: string, newNote: NewNote) => (
    noteService.update(id, newNote)
      .then((returnedNote) => setNotes(
        notes.map((note) => (note.id === id ? returnedNote : note)),
      ))
  );

  const handleNoteDelete = (id: string) => {
    const note = notes.find((n) => n.id === id);

    // cannot find the note in local cache
    // TODO: reload notes from server
    if (!note) {
      setErrorMessage({ title: '找不到您要删除的便签', content: '请刷新后重试' });
    } else {
      // make undoNoteRemove to get right notes
      const filteredNotes = notes.filter((n) => n.id !== id);
      // remove note from UI
      setNotes(filteredNotes);

      noteService.remove(id)
        .catch((error) => {
          if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 404) {
              return setErrorMessage({ title: '您要删除的便签已不存在', content: null });
            }
          }

          const friendlyLog = toErrorMessage(error);
          return setErrorMessage(friendlyLog);
        });

      const undoNoteRemove = () => (
        noteService.undoRemove(id)
          // add note back
          // notes in state will not auto update here
          .then((returnedNote) => setNotes(filteredNotes.concat(returnedNote)))
          .catch((error) => {
            // it should not happened unless we forgot to reset the Snackbar
            // TODO: reload notes from server
            if (error.response && error.response.status === 404) {
              return setErrorMessage({ title: '您要恢复的便签已不存在', content: null });
            }

            const friendlyLog = toErrorMessage(error);
            return setErrorMessage(friendlyLog);
          })
      );

      setSnackbar(
        `便签「${note.content}」已被删除`,
        // I don't know why I have to make it as arrow function, but it works
        // see setCacheUndo() in components/NotificationSnackbar.tsx
        () => undoNoteRemove,
      );
    }
  };

  useEffect(() => {
    if (user !== null) {
      localStorage.setItem('user', JSON.stringify(user));
      noteService.getAll()
        .then((n) => setNotes(n))
        .catch((error: Error | AxiosError) => {
          if (axios.isAxiosError(error)) {
            // session is invalid
            if (error.response?.status === 401) {
              localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            // TODO
            throw error;
          }
        });
    } else {
      const cacheUser = localStorage.getItem('user');

      if (cacheUser !== null) {
        const parsedUser = toUser(JSON.parse(cacheUser));
        setUser(parsedUser);
      } else {
        setNotes([]);
      }
    }
  }, [user]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>燕雀便签</title>
        <meta name="description" content="一个简单的便签应用" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <ApplicationBar
          handleLogout={handleLogout}
          displayName={user === null ? null : user.name}
          showLogin={() => setShowLogin(true)}
          showEditPassword={() => setShowEditPassword(true)}
          showRegister={() => setShowRegister(true)}
        />

        <Login
          display={showLogin}
          hideDialog={() => setShowLogin(false)}
          login={handleLogin}
          setErrorMessage={setErrorMessage}
        />

        <EditPassword
          display={showEditPassword}
          hideDialog={() => setShowEditPassword(false)}
          editPassword={handleEditPassword}
          setSnackbar={setSnackbar}
          setErrorMessage={setErrorMessage}
        />

        <Register
          display={showRegister}
          hideDialog={() => setShowRegister(false)}
          register={handleRegister}
          getActivateState={getActivateState}
          resendEmail={resendVerifyEmail}
          setSnackbar={setSnackbar}
          setErrorMessage={setErrorMessage}
        />

        {/* TODO: abstract to show more type of message */}
        <ErrorDialog
          message={errorMessage}
          hideDialog={() => setErrorMessage(null)}
        />

        <NoteForm
          display={showNoteForm}
          createNote={handleNoteCreate}
          hideDialog={() => setShowNoteForm(false)}
          setErrorMessage={setErrorMessage}
        />

        <Container component="main">
          <Box sx={{ my: 2 }}>
            {notes.length === 0
              ? (
                <>
                  {/* TODO: display a user guide */}
                  <div>点击右下角的按钮，开始记录您的第一条便签！</div>
                </>
              )
              : (
                <Notes
                  notes={notes}
                  updateNote={handleNoteUpdate}
                  deleteNote={handleNoteDelete}
                  setErrorMessage={setErrorMessage}
                />
              )}
          </Box>
        </Container>

        <NotificationSnackbar
          message={message}
          timeout={UNDO_TIMEOUT}
          actionUndo={snackbarActionUndo}
          hideSnackbar={hideSnackbar}
        />

        {/* TODO: we might use router later */}
        {user === null
          ? null
          : <NewFab showNoteForm={() => setShowNoteForm(true)} />}
      </main>
    </ThemeProvider>
  );
}
