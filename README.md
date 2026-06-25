# adiabatic.garden

A highly scalable, fast, and minimalist personal website built using **Eleventy (11ty)**, featuring Math/LaTeX support (KaTeX) and beautiful static rendering.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
Starts a local web server with hot-reloading at `http://localhost:8080`:
```bash
npm start
```

### 3. Build Static Site
Compiles your entire site into the `_site/` directory:
```bash
npm run build
```

---

## ✍️ How to Publish a New Post

Writing and publishing is now fully automated. There are no compile scripts or manual index lists to update.

1. Create a new Markdown (`.md`) file in **`src/pages/`** (or **`src/favs/`** if it's a favorite/featured post).
2. At the very top of the file, define your post's metadata using YAML front matter:

```markdown
---
layout: layouts/post.njk
title: "My New Article Title"
date: 2026-06-21
author: "Yoyo"
category: "lab"       # Choose: "lab", "problems", or "stories" (or "favs" for favorites)
---

This is your post content written in **Markdown**.

### KaTeX / Math Formulas
You can write inline math formulas using `$E = mc^2$` or block equations:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

If you ever want to decouple a file's physical name from its compiled web URL, you can define a permalink variable directly in the post's front matter:
---
layout: layouts/post.njk
title: "MRI and ultrasound physics"
date: 2026-04-09
category: "favs"
permalink: "/neuroscience/mri-and-ultrasound/"   # Custom variable URL!


3. Git-commit and push! Your `/writing` page directory will automatically update and sort the post chronologically (newest first).

---

## 📂 Project Structure

```text
├── src/                          # Raw editable source files
│   ├── _includes/
│   │   └── layouts/
│   │       ├── base.njk          # Global page shell (styles, dynamic tab bar)
│   │       └── post.njk          # Blog post layout (Math rendering, back button)
│   ├── assets/                   # Static images, videos, and fonts
│   ├── css/                      # Site stylesheets
│   ├── js/                       # Client-side scripts (snow.js, config.js)
│   ├── favs/                     # Favorite posts (.md)
│   ├── pages/                    # Lab notebooks, problems, & story posts (.md)
│   ├── index.html                # Main homepage grid
│   ├── writing.html              # Dynamic, auto-generated post index list
│   └── me.html, readlogs.html, etc. # Static pages inheriting from base layout
├── .eleventy.js                  # Eleventy build & static-copy configuration
├── vercel.json                   # Vercel configuration for clean, extensionless URLs
├── wrangler.toml                 # Cloudflare Pages deployment configuration
└── _site/                        # Generated output directory (ignored by Git)
```

---

## 🌐 Deployment

### Vercel (Recommended)
Every `git push` to your main branch will automatically trigger Vercel to compile and deploy your site from the `_site` directory using clean URLs.

### Cloudflare Pages
To deploy manually to Cloudflare Pages, run:
```bash
npm run deploy
```
### Sync curius bookmarks
Fetch all bookmarks from the Curius API into `src/_data/curius.json`:
```
npm run fetch:curius
```

### Related-links recommendations
Each post shows "Related links from Yoyo's bookshelf" at the bottom. Two engines:

1. **Build-time TF-IDF** (default, no setup): `.eleventy.js` `relatedBookmarks` filter scores
   bookmarks against each page by keyword cosine similarity. Always works.
2. **Embeddings + HDBSCAN** (better, optional): precomputes semantic matches with OpenAI
   embeddings and clusters bookmarks. When `src/_data/related.json` exists it takes priority
   over the TF-IDF fallback.

To (re)build the embedding matches:
```
pip install -r scripts/requirements.txt
export OPENAI_API_KEY=sk-...
npm run embed:curius          # writes src/_data/related.json + curius-clusters.json
npm run build
```
`embed:curius` caches vectors in `src/_data/.embed-cache.json` (gitignored), so re-runs only
embed new/changed bookmarks and pages. Re-run it after `fetch:curius` or after editing posts.
