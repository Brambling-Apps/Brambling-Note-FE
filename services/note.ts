import axios from 'axios';
import { NewNote, Note } from '@/utils/types';

axios.defaults.withCredentials = true;
const baseUrl = '/api/notes/';

const getAll = async () => {
  const response = await axios.get<Note[]>(baseUrl);
  return response.data;
};

const create = async (newNote: NewNote) => {
  const response = await axios.post<Note>(baseUrl, newNote);
  return response.data;
};

const update = async (id: string, newNote: NewNote) => {
  const response = await axios.put<Note>(`${baseUrl}${id}`, newNote);
  return response.data;
};

const remove = (id: string) => (
  axios.delete<void>(`${baseUrl}${id}`)
);

const undoRemove = async (id: string) => {
  const response = await axios.patch<Note>(`${baseUrl}undo-delete/${id}`);
  return response.data;
};

export default {
  getAll,
  create,
  update,
  remove,
  undoRemove,
};
