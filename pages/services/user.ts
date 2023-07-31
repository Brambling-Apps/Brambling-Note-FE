import axios from 'axios';
import { NewUser, User } from '../types';

axios.defaults.withCredentials = true;
const baseUrl = '/api/users/';

const create = async (newUser: NewUser) => {
  const response = await axios.post<User>(baseUrl, newUser);
  return response.data;
};

// TODO
const patch = async (newUser: NewUser) => {
  const response = await axios.patch<User>(
    baseUrl,
    [{ op: 'replace', path: '/password', value: newUser.password }],
    { headers: { 'Content-Type': 'application/json-patch+json' } },
  );
  return response.data;
};

const get = async () => {
  const response = await axios.get<User>(baseUrl);
  return response.data;
};

const sendVerifyEmail = async () => {
  const response = await axios.get<void>(`${baseUrl}verification-email`);
  return response.data;
};

export default {
  create, patch, get, sendVerifyEmail,
};
