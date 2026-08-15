const cheerio = require("cheerio");

const inlineNoteHeadings = new Map();
const bookmarkIndexCache = new WeakMap();
const STOPWORDS = new Set([
  "the","and","for","are","but","not","you","all","can","had","her","was",
  "one","our","out","has","have","been","some","them","than","its","over",
  "such","that","this","with","will","which","what","when","where","how",
  "about","into","through","during","before","after","above","below",
  "between","under","because","just","also","very","more","most","few",
  "then","own","same","here","there","please","etc","via","from","they",
  "their","would","could","should","may","might","these","those",
  "each","every","both","any","http","https","www","com","org","net","edu"
]);

function tokenize(text, weight) {
  const tokens = [];
  const cleaned = String(text || "").replace(/<[^>]*>/g, " ")
    .toLowerCase()
    .replace(/[#_\-/\[\](){}"'.,!?;:«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const token of cleaned.split(/\s+/)) {
    if (token.length >= 3 && !STOPWORDS.has(token)) {
      for (let index = 0; index < weight; index++) tokens.push(token);
    }
  }
  return tokens;
}

function headingSlug(text, fallback) {
  const slug = text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}

module.exports = function(eleventyConfig) {
  // Pass-through copy of static folders
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/archive");
  eleventyConfig.addPassthroughCopy({
    "node_modules/computer-modern/fonts/cmu-typewriter-text-200-roman.woff2":
      "assets/fonts/cmu-typewriter-text-200-roman.woff2"
  });
  
  // Pass-through copy of media files at the root level of src
  eleventyConfig.addPassthroughCopy("src/*.png");
  eleventyConfig.addPassthroughCopy("src/*.jpg");
  eleventyConfig.addPassthroughCopy("src/*.webp");
  eleventyConfig.addPassthroughCopy("src/*.mp4");
  eleventyConfig.addPassthroughCopy({"03. Deep Space Travels.mp3": "03. Deep Space Travels.mp3"});

  // YouTube embed shortcode
  eleventyConfig.addShortcode("youtube", function(id) {
    return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0; border: 1px solid #bcc0cc; border-radius: 4px;">
  <iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>`;
  });

  // Date formatting filter matching MM-DD-YYYY
  eleventyConfig.addFilter("formatDate", function(dateObj) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${month}-${day}-${year}`;
  });

  // Prepare a note for a composed "forest" view. Heading and footnote ids are
  // namespaced so independently-authored pages remain valid in one document.
  eleventyConfig.addFilter("inlineNote", function(html, prefix) {
    const $ = cheerio.load(html || "", null, false);
    const headings = $("h1,h2,h3,h4,h5,h6").toArray();
    const minimumLevel = headings.length
      ? Math.min(...headings.map((heading) => Number(heading.tagName.slice(1))))
      : 1;
    const usedIds = new Set();
    const fragmentMap = new Map();
    const outline = [];

    headings.forEach((heading, index) => {
      const $heading = $(heading);
      const originalId = $heading.attr("id");
      const baseId = originalId || headingSlug($heading.text(), `section-${index + 1}`);
      let localId = baseId;
      let duplicate = 2;
      while (usedIds.has(localId)) localId = `${baseId}-${duplicate++}`;
      usedIds.add(localId);

      const id = `${prefix}-${localId}`;
      const level = Math.min(Number(heading.tagName.slice(1)) - minimumLevel + 3, 6);
      fragmentMap.set(originalId || baseId, id);
      outline.push({ id, title: $heading.text().trim(), level });
      $heading.replaceWith(`<h${level} id="${id}">${$heading.html()}</h${level}>`);
    });

    // Footnote ids and any other fragment targets can also repeat between notes.
    $("[id]").each((_, element) => {
      const $element = $(element);
      const oldId = $element.attr("id");
      if (!oldId || oldId.startsWith(`${prefix}-`)) return;
      const id = `${prefix}-${oldId}`;
      fragmentMap.set(oldId, id);
      $element.attr("id", id);
    });
    $("a[href^='#']").each((_, element) => {
      const $element = $(element);
      const fragment = $element.attr("href").slice(1);
      if (fragmentMap.has(fragment)) $element.attr("href", `#${fragmentMap.get(fragment)}`);
    });
    $("img").attr("loading", "lazy").attr("decoding", "async");
    $("iframe").attr("loading", "lazy");

    inlineNoteHeadings.set(prefix, outline.filter((heading) => heading.level === 3));
    return $.html();
  });

  eleventyConfig.addFilter("inlineNoteHeadings", function(prefix) {
    return inlineNoteHeadings.get(prefix) || [];
  });

  eleventyConfig.addFilter("containsMath", function(content) {
    return /(^|[^\\])\${1,2}\S[\s\S]*?\${1,2}/m.test(content || "");
  });

  // Related bookmarks from curius via text similarity
  eleventyConfig.addFilter("relatedBookmarks", function(curius, title, tags, content, maxResults = 5) {
    if (!curius || !curius.length) return [];

    const pageTokens = [
      ...tokenize(title, 3),
      ...tokenize((tags || []).join(" "), 3),
      ...tokenize(content, 1),
    ];

    let index = bookmarkIndexCache.get(curius);
    if (!index) {
      const tokenSets = curius.map((bookmark) => [
        ...tokenize(bookmark.title, 3),
        ...tokenize((bookmark.topics || []).join(" "), 3),
        ...tokenize(bookmark.snippet, 1),
      ]);
      const docFreq = new Map();
      for (const tokens of tokenSets) {
        for (const token of new Set(tokens)) {
          docFreq.set(token, (docFreq.get(token) || 0) + 1);
        }
      }

      const size = curius.length;
      const idfFor = (token) => Math.log((size + 1) / ((docFreq.get(token) || 0) + 1)) + 1;
      const bookmarks = curius.map((bookmark, bookmarkIndex) => {
        const frequency = new Map();
        for (const token of tokenSets[bookmarkIndex]) {
          frequency.set(token, (frequency.get(token) || 0) + 1);
        }
        let magnitudeSquared = 0;
        for (const [token, count] of frequency) {
          const value = count * idfFor(token);
          magnitudeSquared += value * value;
        }
        return { bookmark, frequency, magnitude: Math.sqrt(magnitudeSquared) };
      });
      index = { bookmarks, idfFor };
      bookmarkIndexCache.set(curius, index);
    }

    const queryFrequency = new Map();
    for (const token of pageTokens) {
      queryFrequency.set(token, (queryFrequency.get(token) || 0) + 1);
    }
    const queryWeights = new Map();
    let queryMagnitudeSquared = 0;
    for (const [token, count] of queryFrequency) {
      const value = count * index.idfFor(token);
      queryWeights.set(token, value);
      queryMagnitudeSquared += value * value;
    }
    const queryMagnitude = Math.sqrt(queryMagnitudeSquared);

    return index.bookmarks
      .map(({ bookmark, frequency, magnitude }) => {
        let dot = 0;
        for (const [token, queryValue] of queryWeights) {
          const bookmarkCount = frequency.get(token);
          if (bookmarkCount) {
            dot += queryValue * bookmarkCount * index.idfFor(token);
          }
        }
        const score = queryMagnitude && magnitude ? dot / (queryMagnitude * magnitude) : 0;
        return { bookmark, score };
      })
      .filter(({ score }) => score > 0.08)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ bookmark }) => bookmark);
  });

  // Dynamic collections sorted by date (newest first)
  eleventyConfig.addCollection("favs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/favs/*.md").sort((a, b) => b.date - a.date);
  });
  
  eleventyConfig.addCollection("lab", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/pages/*.md")
      .filter(item => item.data.category === "lab")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("problems", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/pages/*.md")
      .filter(item => item.data.category === "problems")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("stories", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/pages/*.md")
      .filter(item => item.data.category === "stories")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: "src",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
