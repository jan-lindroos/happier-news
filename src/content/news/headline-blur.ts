import '../style/headline-blur.css';
import type { Headline } from "../content.types";

let colourCache = new Map<string, string>();

/**
 * Applies a blur effect to the given headline element by caching its computed colour
 * and setting a CSS custom property, then adding a CSS class to apply styling.
 *
 * @param {Headline} headline - An object containing the headline data.
 */
export function blurHeadline(headline: Headline) {
  if (!colourCache.has(headline.title)) {
    const colour = getComputedStyle(headline.element).color;
    colourCache.set(headline.title, colour);
  }

  headline.element.style.setProperty('--colour', colourCache.get(headline.title)!);
  headline.element.classList.add('headline-blur');
}

/**
 * Removes the headline-blur class from the provided headline's HTML element
 * to unblur the visual representation of the headline.
 *
 * @param {Headline} headline - An object containing the headline data.
 */
export function unblurHeadline(headline: Headline) {
  headline.element.classList.remove('headline-blur');
}