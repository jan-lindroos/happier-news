# Happier (News)

Research consistently shows that negative news content has measurable psychological effects on readers. Studies have found exposure to such negative news content can reduce interpersonal trust and helping behavior [[1]](https://www.sciencedirect.com/science/article/abs/pii/S0747563218305466). Negative news headlines create cognitive bias patterns that persist beyond the reading experience, while negatively valenced news bulletins increase both anxiety and sadness in viewers [[2]](https://www.researchgate.net/publication/14149927_The_psychological_impact_of_negative_TV_news_bulletins_The_catastrophizing_of_personal_worries).

This browser extension addresses these documented effects by providing users with granular control over their exposure to negative headlines. Rather than avoiding news entirely, it enables selective consumption of information while reducing unintentional exposure to distressing content.

## Features

The extension operates on any website through content script injection, which, of course, includes news sites but can also include social media like Reddit and Twitter. Enable or disable functionality per-site through the browser action button. When enabled, the extension automatically processes and blurs headlines using a sentiment analysis model on page load and during dynamic content updates.

https://github.com/user-attachments/assets/2611f338-acbd-4361-a779-165a37453cc1

Blurred headlines can be temporarily unblurred by hovering the cursor over them. The original text remains accessible underneath the blur effect, allowing users to selectively view content without permanently removing the filter.

https://github.com/user-attachments/assets/8cd50416-8556-4f6e-ab02-a820180deaa2

A slider control adjusts the sensitivity parameter for the sentiment analysis model. Lower values result in fewer headlines being classified as negative and blurred, while higher values increase the filtering scope to catch more potentially negative content.

https://github.com/user-attachments/assets/7c377b64-ed9f-453d-bfa2-08099c2d0c3d

## Approach

The extension employs a MiniLM-L12-H384-uncased transformer model fine-tuned via the Hugging Face ecosystem for identifying upsetting news content. This BERT-based architecture balances classification accuracy with the size constraints of browser deployment, achieving comparable results to BERT-Base model on the SST-2 benchmark [[3]](https://huggingface.co/microsoft/MiniLM-L12-H384-uncased), which most closely resmbles its role here.

Model inference utilises WebGPU acceleration when available, reducing processing latency during headline classification. A MutationObserver detects DOM changes to handle dynamically loaded content from infinite scroll, AJAX requests, and SPA navigation. Classification results are cached to prevent redundant processing of previously analysed headlines. Finally, Svelte is used for building out the UI elements of the extension.

## Credits

<a href="https://www.flaticon.com/free-icons/news-feed" title="news-feed icons">News-feed icons created by SeyfDesigner - Flaticon</a>
