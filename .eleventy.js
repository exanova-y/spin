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

  // Date formatting filter matching MM-DD-YYYY
  eleventyConfig.addFilter("formatDate", function(dateObj) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${month}-${day}-${year}`;
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
