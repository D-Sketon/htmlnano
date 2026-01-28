import { init } from '../htmlnano.ts';
import type { HtmlnanoOptions } from '../../src/types.js';
import safePreset from '../../dist/presets/safe.mjs';
import maxPreset from '../../dist/presets/max.mjs';

describe('collapseWhitespace', () => {
    const html = ` <div>
    <p>      Hello world	</p>
    <pre>   <code>	posthtml    htmlnano     </code>	</pre>
    <code>	posthtml    htmlnano     </code>
            <b> hello  world! </b>  <a>other link
    </a>
    Example   </div>  `;

    const spaceInsideTextNodeHtml = `
<div>
    <span> lorem
        <span>
            iorem
        </span>
    </span>
</div>
<div>
    lorem
    <span>
        opren
    </span>
</div>
`;

    const documentationHtml = `<div>
    hello  world!
    	<a href="#">answer</a>
    <style>div  { color: red; }  </style>
		<main></main>
</div>`;

    const inviolateTags = 'comments, <script>, <style>, <pre>, <textarea>';
    const inviolateTagsHtml = `<script> alert() </script>  <style>.foo  {}</style> <pre> hello <b> , </b> </pre>
      <div> <!--  hello   world  --> </div>
	  <textarea> world! </textarea>`;

    const topLevelTags = 'top-level tags (html, head, body)';
    const topLevelTagsHtml = ` <html>
                    <head>
                        <title> Test   Test  </title>
                        <script> </script>
                    </head>
                    <body>
                    </body>
                </html> `;

    context('all', () => {
        const options: HtmlnanoOptions = {
            collapseWhitespace: maxPreset.collapseWhitespace as HtmlnanoOptions['collapseWhitespace']
        };

        it('should collapse redundant whitespaces', () => {
            return init(
                html,
                '<div><p>Hello world</p><pre>   <code>	posthtml    htmlnano     </code>	</pre><code>posthtml htmlnano</code><b>hello world!</b><a>other link</a>Example</div>',
                options
            );
        });

        it('should not collapse whitespaces inside ' + inviolateTags, () => {
            return init(
                inviolateTagsHtml,
                '<script> alert() </script><style>.foo  {}</style><pre> hello <b> , </b> </pre>'
                + '<div><!--  hello   world  --></div><textarea> world! </textarea>',
                options
            );
        });

        it('should collapse whitespaces between ' + topLevelTags, () => {
            return init(
                topLevelTagsHtml,
                '<html><head><title>Test Test</title><script> </script></head><body></body></html>',
                options
            );
        });

        it('should collapse whitespaces inside text node', () => {
            return init(
                spaceInsideTextNodeHtml,
                '<div><span>lorem<span>iorem</span></span></div><div>lorem<span>opren</span></div>',
                options
            );
        });

        it('should preserve whitespace inside template content', () => {
            return init(
                '<template>  <div> a   b </div> </template>',
                '<template>  <div> a   b </div> </template>',
                options
            );
        });

        it('renders the documentation example correctly', () => {
            return init(
                documentationHtml,
                '<div>hello world!<a href="#">answer</a><style>div  { color: red; }  </style><main></main></div>',
                options
            );
        });
    });

    context('aggressive', () => {
        const options: HtmlnanoOptions = {
            collapseWhitespace: 'aggressive'
        };

        it('should collapse redundant whitespaces and eliminate indentation (tabs, newlines, etc)', () => {
            return init(
                html,
                '<div><p>Hello world</p><pre>   <code>	posthtml    htmlnano     </code>	</pre><code> posthtml htmlnano </code> <b>hello world! </b><a>other link </a>Example</div>',
                options
            );
        });

        it('should not collapse whitespaces inside ' + inviolateTags, () => {
            return init(
                inviolateTagsHtml,
                '<script> alert() </script><style>.foo  {}</style><pre> hello <b> , </b> </pre>'
                + '<div><!--  hello   world  --></div><textarea> world! </textarea>',
                options
            );
        });

        it('should collapse whitespaces between ' + topLevelTags, () => {
            return init(
                topLevelTagsHtml,
                '<html><head><title>Test Test</title><script> </script></head><body></body></html>',
                options
            );
        });

        it('should collapse whitespaces inside text node', () => {
            return init(
                spaceInsideTextNodeHtml,
                '<div><span> lorem <span>iorem </span> </span></div><div>lorem <span>opren </span></div>',
                options
            );
        });

        // https://github.com/maltsev/htmlnano/issues/145
        it('issue #145', () => {
            return init(
                'before <a href="#link"> <i>after</i> </a> end',
                'before <a href="#link"><i>after</i> </a>end',
                options
            );
        });

        it('handle whitespace along with comment', () => {
            return init(
                '<div>before<!-- --> <!-- --><a href="#link"></a>  <!-- -->  <!-- --> after</div>',
                '<div>before<!-- --> <!-- --><a href="#link"></a> <!-- --> <!-- --> after</div>',
                options
            );
        });

        it('trims leading whitespace inside inline elements when prior text ends with space', () => {
            return init(
                '<div>before  <span>  text</span></div>',
                '<div>before <span>text</span></div>',
                options
            );
        });

        it('preserves leading and trailing spaces inside code', () => {
            return init(
                '<div><code> foo </code><span>bar</span></div>',
                '<div><code> foo </code><span>bar</span></div>',
                options
            );
        });

        it('drops whitespace-only text nodes between comments and block tags', () => {
            return init(
                '<div>foo<!--c-->   <p>bar</p></div>',
                '<div>foo<!--c--><p>bar</p></div>',
                options
            );
        });

        it('renders the documentation example correctly', () => {
            return init(
                documentationHtml,
                '<div>hello world! <a href="#">answer</a><style>div  { color: red; }  </style><main></main></div>',
                options
            );
        });
    });

    context('invalid option', () => {
        const options: HtmlnanoOptions = {
            collapseWhitespace: 'unknown' as HtmlnanoOptions['collapseWhitespace']
        };

        it('should fall back to conservative behavior', () => {
            return init(
                '<div>  foo  </div>',
                '<div> foo </div>',
                options
            );
        });
    });

    context('conservative (default)', () => {
        const options: HtmlnanoOptions = {
            collapseWhitespace: safePreset.collapseWhitespace as HtmlnanoOptions['collapseWhitespace']
        };

        it('should collapse to 1 space', () => {
            return init(
                html,
                '<div> <p> Hello world </p> <pre>   <code>	posthtml    htmlnano     </code>	</pre> <code> posthtml htmlnano </code> <b> hello world! </b> <a>other link </a> Example </div>',
                options
            );
        });

        it('should collapse whitespaces between ' + topLevelTags, () => {
            return init(
                topLevelTagsHtml,
                '<html><head><title> Test Test </title><script> </script></head><body> </body></html>',
                options
            );
        });

        it('should not collapse whitespaces inside ' + inviolateTags, () => {
            return init(
                inviolateTagsHtml,
                '<script> alert() </script><style>.foo  {}</style><pre> hello <b> , </b> </pre>'
                + '<div> <!--  hello   world  --> </div><textarea> world! </textarea>',
                options
            );
        });

        it('should collapse whitespaces inside text node', () => {
            return init(
                spaceInsideTextNodeHtml,
                '<div> <span> lorem <span> iorem </span> </span> </div><div> lorem <span> opren </span> </div>',
                options
            );
        });

        it('renders the documentation example correctly', () => {
            return init(
                documentationHtml,
                '<div> hello world! <a href="#">answer</a> <style>div  { color: red; }  </style> <main></main> </div>',
                options
            );
        });
    });
});
