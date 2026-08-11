const noteIds = require("../_data/noteIds");

module.exports = {
  eleventyComputed: {
    noteId: (data) => noteIds[data.page.fileSlug]
  }
};
