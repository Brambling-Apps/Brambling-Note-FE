import axios from 'axios';
import { LoginUser, User } from '../types';

axios.defaults.withCredentials = true;
const baseUrl = '/api/sessions/';

const login = async (credentials: LoginUser) => {
  const response = await axios.get<User>(
    `${baseUrl}${credentials.email}?password=${credentials.password}`,
  );
  return response.data;
};

const logout = () => axios.delete<void>(baseUrl);

export default { login, logout };
