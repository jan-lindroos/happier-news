/**
 * Represents a message with a specific type and associated content.
 *
 * @template T - The type of the content contained in the message.
 * @property {string} type - The type or classification of the message.
 * @property {T} content - The content or payload associated with the message.
 */
export interface Message<T> {
  type: string;
  content: T;
}

export interface StorageOperation<T> {
  method: 'set' | 'get' | 'add' | 'remove';
  key: string;
  data: T;
}