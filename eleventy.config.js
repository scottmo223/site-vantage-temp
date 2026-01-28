export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "public": "public" });
  eleventyConfig.addPassthroughCopy({ "advanced-robot/3d-objs": "advanced-robot/3d-objs" });
  eleventyConfig.addPassthroughCopy({ "advanced-robot/js": "advanced-robot/js" });
  eleventyConfig.addPassthroughCopy({ "tesla-ball/tesla-ball.js": "tesla-ball/tesla-ball.js" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy("robots.txt");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
