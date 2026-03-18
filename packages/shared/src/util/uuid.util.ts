import { v4 as uuidv4 } from "uuid";

export const generateUUID = (): string => {
  return uuidv4();
};
export const generateShortUUID = (n = 8): string => {
  return uuidv4().slice(0, n);
};
