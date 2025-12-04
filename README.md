# happier-news
[![Hugging Face](https://img.shields.io/badge/🤗%20Hugging%20Face-Microsoft%20MiniLM-yellow)]([https://huggingface.co/your-username/your-model](https://huggingface.co/microsoft/MiniLM-L12-H384-uncased))

<img src="https://github.com/user-attachments/assets/cd2f307e-789a-4a3e-b1a2-4a7dd436e56d" width="400">

## About this repo

Research consistently shows that negative news content has measurable psychological effects on readers. Studies have found exposure to such negative news content can reduce interpersonal trust and helping behavior [[1]](https://www.sciencedirect.com/science/article/abs/pii/S0747563218305466). This Chrome extension aims to address this by blurring out negative news, with a variable sensitivity to account for personal preferences.

## Approach

The extension uses a MiniLM-L12-H384-uncased model (comparable to BERT-Base model on the SST-2 benchmark [[3]](https://huggingface.co/microsoft/MiniLM-L12-H384-uncased)) fine-tuned via the Hugging Face ecosystem for identifying upsetting news content.

Model inference utilises WebGPU acceleration when available. A MutationObserver detects DOM changes to handle dynamically loaded content from infinite scroll, AJAX requests, and SPA navigation. Classification results are cached to prevent redundant processing of previously analysed headlines.

## Credits

<a href="https://www.flaticon.com/free-icons/news-feed" title="news-feed icons">News-feed icons created by SeyfDesigner - Flaticon</a>
