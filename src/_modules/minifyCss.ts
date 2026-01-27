import { isStyleNode, extractCssFromStyleNode, optionalImport } from '../helpers';
import type {} from 'postcss';
import type { HtmlnanoModule } from '../types';
import type PostHTML from 'posthtml';
import type { Options as CssnanoOptions } from 'cssnano';

const postcssOptions = {
    // Prevent the following warning from being shown:
    // > Without `from` option PostCSS could generate wrong source map and will not find Browserslist config.
    // > Set it to CSS file path or to `undefined` to prevent this warning.
    from: undefined
};

const cdataStart = '<![CDATA[';
const cdataEnd = ']]>';

/** Minify CSS with cssnano */
const mod: HtmlnanoModule<CssnanoOptions> = {
    async default(tree, _, cssnanoOptions) {
        const cssnano = await optionalImport<typeof import('cssnano')>('cssnano');
        const postcss = await optionalImport<typeof import('postcss').default>('postcss');

        if (!cssnano || !postcss) {
            return tree;
        }

        const promises: Promise<void>[] = [];

        let p: Promise<void> | undefined;

        tree.walk((node) => {
        // Skip SRI, reasons are documented in "minifyJs" module
            if (node.attrs && 'integrity' in node.attrs) {
                return node;
            }

            if (isStyleNode(node) && isCssStyleType(node)) {
                p = processStyleNode(node, cssnanoOptions, cssnano, postcss);
                if (p) {
                    promises.push(p);
                }
            } else if (node.attrs && node.attrs.style) {
                p = processStyleAttr(node, cssnanoOptions, cssnano, postcss);
                if (p) {
                    promises.push(p);
                }
            }

            return node;
        });

        return Promise.all(promises).then(() => tree);
    }
};

export default mod;

function processStyleNode(styleNode: PostHTML.Node, cssnanoOptions: CssnanoOptions, cssnano: typeof import('cssnano'), postcss: typeof import('postcss').default) {
    let css = extractCssFromStyleNode(styleNode);
    if (!css || css.trim() === '') return;

    // Improve performance by avoiding calling stripCdata again and again
    const { strippedCss, isCdataWrapped } = stripCdata(css);
    css = strippedCss;

    return postcss([cssnano(cssnanoOptions)])
        .process(css, postcssOptions)
        .then((result) => {
            if (isCdataWrapped) {
                styleNode.content = ['<![CDATA[' + result.toString() + ']]>'];
            } else {
                styleNode.content = [result.css];
            }
        });
}

function processStyleAttr(node: PostHTML.Node, cssnanoOptions: CssnanoOptions, cssnano: typeof import('cssnano'), postcss: typeof import('postcss').default) {
    // CSS "color: red;" is invalid. Therefore it should be wrapped inside some selector:
    // a{color: red;}
    const wrapperStart = 'a{';
    const wrapperEnd = '}';

    if (!node.attrs || !node.attrs.style || typeof node.attrs.style !== 'string') {
        return;
    }

    if (node.attrs.style.trim() === '') {
        return;
    }

    const wrappedStyle = wrapperStart + (node.attrs.style || '') + wrapperEnd;

    return postcss([cssnano(cssnanoOptions)])
        .process(wrappedStyle, postcssOptions)
        .then((result) => {
            const minifiedCss = result.css;
            // Remove wrapperStart at the start and wrapperEnd at the end of minifiedCss
            node.attrs!.style = minifiedCss.substring(
                wrapperStart.length,
                minifiedCss.length - wrapperEnd.length
            );
        });
}

function stripCdata(css: string) {
    const trimmed = css.trim();
    if (!trimmed.startsWith(cdataStart) || !trimmed.endsWith(cdataEnd)) {
        return { strippedCss: css, isCdataWrapped: false };
    }

    const strippedCss = trimmed.slice(cdataStart.length, trimmed.length - cdataEnd.length);
    return { strippedCss, isCdataWrapped: true };
}

function isCssStyleType(node: PostHTML.Node) {
    if (!node.attrs || !('type' in node.attrs)) {
        return true;
    }

    const rawType = node.attrs.type;
    if (rawType === '') {
        return true;
    }

    if (typeof rawType !== 'string') {
        return false;
    }

    const normalizedType = rawType.trim().toLowerCase();
    return /^text\/css(?:$|\s*;)/.test(normalizedType);
}
