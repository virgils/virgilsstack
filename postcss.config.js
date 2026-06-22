import globalData from "@csstools/postcss-global-data";
import customMedia from "postcss-custom-media";

export default {
  plugins: [
    // Makes the @custom-media breakpoints in app.css visible to every
    // component's scoped <style> block (Svelte compiles those separately).
    globalData({ files: ["src/app.css"] }),
    customMedia(),
  ],
};
