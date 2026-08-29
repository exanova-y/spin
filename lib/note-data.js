// Computed front matter shared by every note directory (`src/pages`,
// `src/highlights`).
//
// A note's taxon is derived at render time from its `category` (see
// `lib/forest.js`), so only the stable public address needs computing here.
const noteIds = require("../src/_data/noteIds");

module.exports = {
  eleventyComputed: {
    noteId: (data) => noteIds[data.page.fileSlug]
  }
};
