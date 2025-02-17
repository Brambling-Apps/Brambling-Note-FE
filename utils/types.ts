interface BaseUser {
  email: string;
  name: string;
}

export interface User extends BaseUser {
  id: string;
  verified: boolean;
  lastVerificationEmail: Date;
}

export interface NewUser extends BaseUser {
  password: string;
}

export interface NewPasswordUser {
  email: string;
  password: string;
  newPassword: string;
}

export type LoginUser = Omit<NewUser, 'name'>;

export interface Note {
  id: string;
  content: string;
  importance: boolean;
  date: string;
  user: User;
}

export type NewNote = Omit<Note, 'id' | 'date' | 'user'>;

export type SnackbarMessage = (content: string, actionUndo: (() => any) | null) => void;

export type ErrorMessage = { title: string | null, content: string | null };
