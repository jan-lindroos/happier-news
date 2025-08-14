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

/**
 * Interface representing an operation to be performed on a storage system.
 *
 * @template T - The type of data associated with the storage operation.
 * @property {('set' | 'get' | 'add' | 'remove')} method - The operation method to be executed on the storage system.
 * @property {string} key - The identifier of the storage entry to perform the operation on.
 * @property {T} data - The data associated with the operation. The data type is generic and depends on the type specified when the interface is implemented.
 */
export interface StorageOperation<T> {
  method: 'set' | 'get' | 'add' | 'remove';
  key: string;
  data: T;
}