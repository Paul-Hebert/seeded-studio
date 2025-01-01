module.exports = (eleventyConfig) => {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget("./.netlify/");

  eleventyConfig.addPassthroughCopy("./styles/**/*");

  eleventyConfig.addCollection("art", function (collection) {
    return collection.getFilteredByGlob("art/*/*.md");
  });

  eleventyConfig.setQuietMode(true);
};
