module.exports = (eleventyConfig) => {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget("./.netlify/");

  eleventyConfig.addCollection("art", function (collection) {
    return collection.getFilteredByGlob("art/*/*.md");
  });
};
