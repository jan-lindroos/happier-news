import '../style/headline-blur.css';
import type { Headline } from "../content.types";

let colourCache = new Map<string, string>();
let rafScheduled = false;

window.addEventListener('mousemove', (e) => {
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;

      document.querySelectorAll('.headline-blur[unblur]')
        .forEach(element => element.removeAttribute('unblur'));

      document.elementsFromPoint(e.clientX, e.clientY)
        .filter(element => element.classList?.contains('headline-blur'))
        .forEach(element => element.setAttribute('unblur', ''));
    });
  }
}, { passive: true });

export function blurHeadline(headline: Headline) {
  if (!colourCache.has(headline.title)) {
    const colour = getComputedStyle(headline.element).color;
    colourCache.set(headline.title, colour);
  }

  headline.element.style.setProperty('--colour', colourCache.get(headline.title)!);
  headline.element.classList.add('headline-blur');
}

export function unblurHeadline(headline: Headline) {
  headline.element.classList.remove('headline-blur');
}