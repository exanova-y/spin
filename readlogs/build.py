#!/usr/bin/env python3
"""Render each readlog .md to a same-styled .html in place (flat layout)."""
from pathlib import Path
import markdown

ROOT = Path(__file__).parent

POSTS = [
    # (slug, md filename, page title)
    ("march",     "march-readlogs.md",      "March readlogs"),
    ("november",  "november-readlogs.md",   "November readlogs"),
    ("october",   "october-readlog.md",     "October readlog"),
    ("september", "september-readlog.md",   "September readlog"),
    ("early-may", "early-may-observelog.md", "Early May observelog"),
]

SOURCES = {
    "march":     "https://feralscholars.substack.com/p/march-readlogs",
    "november":  "https://feralscholars.substack.com/p/november-readlogs",
    "october":   "https://feralscholars.substack.com/p/october-readlog",
    "september": "https://feralscholars.substack.com/p/september-readlog",
    "early-may": "https://feralscholars.substack.com/p/early-may-observelog",
}

# Same design tokens as index.html; extra rules for prose/blockquotes/images.
SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title} — readlogs</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root {{
    --bg: #fafaf7;
    --fg: #1a1a1a;
    --muted: #6b6b6b;
    --line: #e2e0d8;
    --accent: #8a4a2a;
    --card: #ffffff;
    --quote: #f2efe6;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{
      --bg: #17161a;
      --fg: #eeeae2;
      --muted: #999;
      --line: #2c2a30;
      --accent: #e8a878;
      --card: #1e1c22;
      --quote: #201d24;
    }}
  }}
  * {{ box-sizing: border-box; }}
  html {{ scroll-behavior: smooth; }}
  body {{
    margin: 0;
    font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Iowan Old Style",
          "Palatino Linotype", Georgia, serif;
    background: var(--bg);
    color: var(--fg);
    padding: 2.5rem 1.2rem 4rem;
  }}
  main {{ max-width: 720px; margin: 0 auto; }}

  .topnav {{
    font-size: .88rem;
    color: var(--muted);
    margin: 0 0 1.5rem;
  }}
  .topnav a {{ color: var(--muted); text-decoration: none; }}
  .topnav a:hover {{ color: var(--accent); text-decoration: underline; }}

  h1 {{
    font-size: 1.7rem;
    margin: 0 0 .25rem;
    letter-spacing: -0.01em;
  }}
  h1 .accent {{ color: var(--accent); }}
  h2 {{
    font-size: 1.25rem;
    margin: 2.2rem 0 .6rem;
    padding-top: .4rem;
    border-top: 1px solid var(--line);
    letter-spacing: -0.005em;
  }}
  h3 {{
    font-size: 1.05rem;
    margin: 1.6rem 0 .4rem;
    color: var(--accent);
  }}
  h4 {{
    font-size: .98rem;
    margin: 1.3rem 0 .3rem;
    color: var(--muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }}
  p, li {{ font-size: 1rem; }}
  p {{ margin: .7rem 0; }}
  a {{ color: var(--accent); }}
  a:hover {{ text-decoration: underline; }}
  em {{ color: var(--fg); }}
  strong {{ color: var(--fg); }}

  hr {{
    border: 0;
    border-top: 1px solid var(--line);
    margin: 2rem 0;
  }}

  ul, ol {{ padding-left: 1.3rem; }}
  li {{ margin: .25rem 0; }}

  blockquote {{
    margin: 1rem 0;
    padding: .7rem 1.1rem;
    border-left: 3px solid var(--accent);
    background: var(--quote);
    color: var(--fg);
    font-size: .96rem;
    border-radius: 0 4px 4px 0;
  }}
  blockquote p:first-child {{ margin-top: 0; }}
  blockquote p:last-child {{ margin-bottom: 0; }}

  code {{
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: .88em;
    background: var(--card);
    border: 1px solid var(--line);
    padding: 1px 5px;
    border-radius: 3px;
  }}
  pre {{
    background: var(--card);
    border: 1px solid var(--line);
    padding: .8rem 1rem;
    border-radius: 6px;
    overflow-x: auto;
    font-size: .88rem;
  }}
  pre code {{ background: none; border: 0; padding: 0; }}

  img {{
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.2rem auto;
    border-radius: 4px;
    border: 1px solid var(--line);
    background: var(--card);
  }}
  img + p em:only-child {{
    display: block;
    text-align: center;
    color: var(--muted);
    font-size: .88rem;
    margin-top: -.7rem;
  }}

  .sub {{
    color: var(--muted);
    margin: 0 0 1.5rem;
    font-size: .95rem;
  }}

  footer {{
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid var(--line);
    font-size: .82rem;
    color: var(--muted);
    line-height: 1.5;
  }}
  footer a {{ color: var(--muted); }}
</style>
</head>
<body>
<main>

<nav class="topnav">
  <a href="index.html">← readlogs index</a>
</nav>

{body}

<footer>
  <p>
    Local mirror. Source:
    <a href="{src}">{src}</a>. See
    <a href="README.md">README.md</a> for provenance.
  </p>
</footer>

</main>
</body>
</html>
"""


def convert(slug: str, md_name: str, title: str):
    md_path = ROOT / md_name
    html_path = md_path.with_suffix(".html")
    text = md_path.read_text(encoding="utf-8")
    body_html = markdown.markdown(
        text,
        extensions=["extra", "sane_lists", "smarty"],
        output_format="html5",
    )
    doc = SHELL.format(title=title, body=body_html, src=SOURCES[slug])
    html_path.write_text(doc, encoding="utf-8")
    print(f"wrote {html_path.relative_to(ROOT)}")


if __name__ == "__main__":
    for slug, md, title in POSTS:
        convert(slug, md, title)
