import { ErrorMessage, User } from './types';

const isString = (text: unknown): text is string => typeof text === 'string' || text instanceof String;

const parseString = (name: string, str: unknown): string => {
  if (!str || !isString(str)) {
    throw new TypeError(`Incorrect or missing ${name}: ${str}`);
  } else {
    return str;
  }
};

type Fields = { id: unknown, email: unknown, name: unknown, token: unknown };

export const toUser = ({
  id, email, name, token,
}: Fields): User => {
  const user: User = {
    id: parseString('id', id),
    email: parseString('email', email),
    name: parseString('name', name),
    token: parseString('token', token),
  };

  return user;
};

export const toErrorMessage = (error: Error): ErrorMessage => (
  {
    title: null,
    content: `error.name:
    ${error.name}

    error.message:
    ${error.message}
    `,
  }
);
