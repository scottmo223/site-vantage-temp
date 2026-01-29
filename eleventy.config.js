export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "public": "public" });
  eleventyConfig.addPassthroughCopy({ "tesla-ball/tesla-ball.js": "tesla-ball/tesla-ball.js" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy("robots.txt");

  eleventyConfig.setServerOptions({
    domDiff: true,
    port: 8080,
    host: "0.0.0.0",
    showAllHosts: true,
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
