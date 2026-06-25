module.exports = function(eleventyConfig) {
  // Pass-through copy of static folders
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/archive");
  
  // Pass-through copy of media files at the root level of src
  eleventyConfig.addPassthroughCopy("src/*.png");
  eleventyConfig.addPassthroughCopy("src/*.jpg");
  eleventyConfig.addPassthroughCopy("src/*.webp");
  eleventyConfig.addPassthroughCopy("src/*.mp4");

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

  // Related bookmarks from curius via text similarity
  eleventyConfig.addFilter("relatedBookmarks", function(curius, title, tags, content, maxResults = 5) {
    if (!curius || !curius.length) return [];

    const STOPWORDS = new Set([
      "the","and","for","are","but","not","you","all","can","had","her","was",
      "one","our","out","has","have","been","some","them","than","its","over",
      "such","that","this","with","will","which","what","when","where","how",
      "about","into","through","during","before","after","above","below",
      "between","under","because","just","also","very","more","most","few",
      "then","own","same","here","there","please","etc","via","from","they",
      "been","their","would","could","should","may","might","these","those",
      "each","every","both","any","http","https","www","com","org","net","edu"
    ]);

    function tokenize(text, weight) {
      const tokens = [];
      const cleaned = text.replace(/<[^>]*>/g, ' ')
        .toLowerCase()
        .replace(/[#_\-/\[\](){}"'.,!?;:«»]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      for (const t of cleaned.split(/\s+/)) {
        if (t.length >= 3 && !STOPWORDS.has(t)) {
          for (let i = 0; i < weight; i++) tokens.push(t);
        }
      }
      return tokens;
    }

    const pageTokens = [
      ...tokenize(title || '', 3),
      ...tokenize((tags || []).join(' '), 3),
      ...tokenize(content || '', 1),
    ];

    const bmTokenSets = curius.map(b => ({
      ...b,
      tokens: [
        ...tokenize(b.title || '', 3),
        ...tokenize((b.topics || []).join(' '), 3),
        ...tokenize(b.snippet || '', 1),
      ],
    }));

    const N = bmTokenSets.length;
    const docFreq = {};
    for (const bm of bmTokenSets) {
      for (const t of new Set(bm.tokens)) {
        docFreq[t] = (docFreq[t] || 0) + 1;
      }
    }

    const qFreq = {};
    for (const t of pageTokens) qFreq[t] = (qFreq[t] || 0) + 1;

    const scored = bmTokenSets.map(bm => {
      const bFreq = {};
      for (const t of bm.tokens) bFreq[t] = (bFreq[t] || 0) + 1;

      const allTerms = new Set([...Object.keys(qFreq), ...Object.keys(bFreq)]);
      let dot = 0, qMag = 0, bMag = 0;

      for (const t of allTerms) {
        const idf = Math.log((N + 1) / ((docFreq[t] || 0) + 1)) + 1;
        const qv = (qFreq[t] || 0) * idf;
        const bv = (bFreq[t] || 0) * idf;
        dot += qv * bv;
        qMag += qv * qv;
        bMag += bv * bv;
      }

      return { ...bm, score: (qMag > 0 && bMag > 0) ? dot / (Math.sqrt(qMag) * Math.sqrt(bMag)) : 0 };
    });

    return scored
      .filter(b => b.score > 0.08)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ tokens, score, ...rest }) => rest);
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
