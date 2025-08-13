import '../style/headline-blur.css';
import type { Headline } from "../content.types";

let colourCache = new Map<string, string>();
let rafScheduled = false;

/**
 * Handles the mouse blur effect by toggling an attribute on elements with the class 'headline-blur'.
 * Removes the 'unblur' attribute from all elements that have it and sets the 'unblur' attribute
 * on the elements directly under the mouse pointer.
 *
 * @param {MouseEvent} event - The mouse event containing the position of the mouse pointer.
 */
function handleMouseBlurEffect(event: MouseEvent) {
  document.querySelectorAll('.headline-blur[unblur]')
    .forEach(element => element.removeAttribute('unblur'));

  document.elementsFromPoint(event.clientX, event.clientY)
    .filter(element => element.classList?.contains('headline-blur'))
    .forEach(element => element.setAttribute('unblur', ''));
}

window.addEventListener('mousemove', (event) => {
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      handleMouseBlurEffect(event);
    });
  }
}, { passive: true });

/**
 * Applies a blurring effect to a given headline by caching its colour,
 * updating its style property, and adding a class for blur styling.
 *
 * @param {Headline} headline - The headline object with the element properties to be blurred.
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
 * Removes the blur effect from a headline by removing the 'headline-blur' class from its element.
 *
 * @param {Headline} headline - The headline object containing the element to unblur.
 */
export function unblurHeadline(headline: Headline) {
  headline.element.classList.remove('headline-blur');
}