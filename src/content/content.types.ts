/**
 * Represents a headline structure, containing a title and its associated HTML element.
 *
 * @interface Headline
 * @property {string} title - The textual content of the headline.
 * @property {HTMLElement} element - The corresponding HTML element associated with the headline.
 */
export interface Headline {
  title: string;
  element: HTMLElement;
}

/**
 * Creates a headline object based on the provided HTML element.
 *
 * @param {HTMLElement} element - The HTML element from which the headline object is created.
 * @return {Headline} An object containing the text content of the element as the title and the element itself.
 */
export function createHeadline(element: HTMLElement): Headline {
  return {
    title: element.textContent!.trim(),
    element: element
  }
}

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