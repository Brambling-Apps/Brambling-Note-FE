import { ErrorMessage, User } from './types';

const isString = (text: unknown): text is string => typeof text === 'string' || text instanceof String;

const parseString = (name: string, str: unknown): string => {
  if (!str || !isString(str)) {
    throw new TypeError(`Incorrect or missing ${name}: ${str}`);
  } else {
    return str;
  }
};

const isBoolean = (bool: unknown): bool is boolean => typeof bool === 'boolean';

const parseBoolean = (bool: unknown): boolean => {
  if (!isBoolean(bool)) {
    throw new TypeError(`Incorrect or missing boolean: ${bool}`);
  } else {
    return bool;
  }
};

const parseDate = (date: unknown): Date => {
  const dateString = parseString('date', date);
  return new Date(dateString);
};

type Fields = {
  id: unknown,
  email: unknown,
  name: unknown,
  verified: unknown,
  lastVerificationEmail: unknown
};

export const toUser = ({
  id, email, name, verified, lastVerificationEmail,
}: Fields): User => ({
  id: parseString('id', id),
  email: parseString('email', email),
  name: parseString('name', name),
  verified: parseBoolean(verified),
  lastVerificationEmail: parseDate(lastVerificationEmail),
});

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
