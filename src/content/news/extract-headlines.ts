import { createHeadline, type Headline } from "../content.types";

const MIN_WORD_COUNT = 4;
const MAX_WORD_COUNT = 18;
const MIN_CHARACTER_COUNT = 10;
const CHARACTERS_PER_WORD = 6.5;

/**
 * Determines whether a given text node should be included based on its content.
 *
 * @param {Text} node - The text node to be evaluated.
 * @return {boolean} Whether the text node meets the inclusion criteria.
 */
function shouldIncludeNode(node: Text): boolean {
  let text = node.textContent?.trim() ?? '';
  if (text === '')
    return false;

  const wordCount = text.split(/\s+/).length;
  const isInWordCountRange = wordCount >= MIN_WORD_COUNT && wordCount <= MAX_WORD_COUNT;

  const charCount = text.length;
  const isInCharCountRange = charCount >= MIN_CHARACTER_COUNT && charCount <= MAX_WORD_COUNT * CHARACTERS_PER_WORD;

  return isInWordCountRange && isInCharCountRange;
}

function sortHeadlinesVertically(headlines: Headline[]): Headline[] {
  return headlines.sort((a, b) => {
    const ay = a.element.getBoundingClientRect().top;
    const by = b.element.getBoundingClientRect().top;

    return ay - by;
  });
}

/**
 * Extracts headline elements from a given container node by traversing its text nodes.
 *
 * @param {Node} container - The root container node from which headlines are extracted.
 * @return {Headline[]} An array of headlines created from the eligible text node's parent elements.
 */
export function extractHeadlines(container: Node): Headline[] {
  const headlines: Headline[] = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node): number => {
        return shouldIncludeNode(node as Text)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    }
  );

  let currentNode: Text | null;
  while ((currentNode = walker.nextNode() as Text)) {
    if (!currentNode.parentElement) continue;
    headlines.push(createHeadline(currentNode.parentElement));
  }

  return sortHeadlinesVertically(headlines);
}
