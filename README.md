<h1><img src="docs/static/logo.png" alt="htmlnano logo" width="90" align="absmiddle">&nbsp;htmlnano</h1>

[![npm version](https://badge.fury.io/js/htmlnano.svg)](http://badge.fury.io/js/htmlnano)
![CI](https://github.com/maltsev/htmlnano/actions/workflows/ci.yml/badge.svg)

Modular HTML minifier, built on top of the [PostHTML](https://github.com/posthtml/posthtml). Inspired by [cssnano](https://github.com/cssnano/cssnano).

## Benchmarks

[html-minifier-terser]: https://www.npmjs.com/package/html-minifier-terser/v/7.2.0
[html-minifier-next]: https://www.npmjs.com/package/html-minifier-next/v/4.15.2
[htmlnano]: https://www.npmjs.com/package/htmlnano/v/3.1.0
[minify]: https://www.npmjs.com/package/@tdewolff/minify/v/2.24.8
[minify-html]: https://www.npmjs.com/package/@minify-html/node/v/0.18.1

| Website                                                       | Source (KB) | [html-minifier-terser] | [html-minifier-next] | [htmlnano] |  [minify] | [minify-html] |
| ------------------------------------------------------------- | ----------: | ---------------------: | -------------------: | ---------: | --------: | ------------: |
| [stackoverflow.blog](https://stackoverflow.blog/)             |         142 |                   3.7% |                32.3% |       6.8% |      4.5% |          4.6% |
| [github.com](https://github.com/)                             |         549 |                   2.9% |                42.2% |      16.6% |      7.3% |          5.7% |
| [en.wikipedia.org](https://en.wikipedia.org/wiki/Main_Page)   |         218 |                   4.6% |                 7.7% |       7.4% |      6.2% |          2.9% |
| [developer.mozilla.org](https://developer.mozilla.org/en-US/) |         109 |                  37.9% |                42.0% |      52.7% |     40.1% |         39.9% |
| [tc39.es](https://tc39.es/ecma262/)                           |        7243 |                   8.5% |                11.8% |       9.3% |      9.5% |          9.1% |
| [apple.com](https://www.apple.com/)                           |         210 |                   9.2% |                14.4% |      11.2% |     10.3% |          9.8% |
| [w3.org](https://www.w3.org/)                                 |          50 |                  19.0% |                24.6% |      23.4% |     24.4% |         20.3% |
| [weather.com](https://weather.com)                            |        1960 |                   0.4% |                11.2% |      19.8% |     11.6% |          0.6% |
| **Avg. minify rate**                                          |             |              **10.8%** |            **23.3%** |  **18.4%** | **14.2%** |     **11.6%** |

Latest benchmarks: https://github.com/maltsev/html-minifiers-benchmark (updated daily).

## Documentation
https://htmlnano.netlify.app


## Usage

```bash
npm install htmlnano
```

```js
const htmlnano = require('htmlnano');
const options = {
    removeEmptyAttributes: false, // Disable the module "removeEmptyAttributes"
    collapseWhitespace: 'conservative' // Pass options to the module "collapseWhitespace"
};
// posthtml, posthtml-render, and posthtml-parse options
const postHtmlOptions = {
    sync: true, // https://github.com/posthtml/posthtml#usage
    lowerCaseTags: true, // https://github.com/posthtml/posthtml-parser#options
    quoteAllAttributes: false, // https://github.com/posthtml/posthtml-render#options
};

htmlnano
    // "preset" arg might be skipped (see "Presets" section below for more info)
    // "postHtmlOptions" arg might be skipped
    .process(html, options, preset, postHtmlOptions)
    .then(function (result) {
        // result.html is minified
    })
    .catch(function (err) {
        console.error(err);
    });
```

Also, you can use it as CLI tool:

```bash
node_modules/.bin/htmlnano --help
```

More usage examples (PostHTML, Gulp, Webpack): https://htmlnano.netlify.app/next/usage
