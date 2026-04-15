import type PostHTML from 'posthtml';
import { extractTextContentFromNode, isAmpBoilerplate } from '../helpers';
import type { HtmlnanoModule } from '../types';
import { normalizeAttrsForKey } from './helpers/normalizeAttrsForKey';

const booleanAttrs = new Set(['amp-custom', 'disabled']);
const skippedAttrs = new Set(['type', 'media']);

function normalizeStyleType(attrs: PostHTML.NodeAttributes) {
    if (!attrs || typeof attrs.type !== 'string') {
        return 'text/css';
    }

    const type = attrs.type.trim();
    return type ? type.toLowerCase() : 'text/css';
}

function normalizeStyleMedia(attrs: PostHTML.NodeAttributes) {
    if (!attrs || typeof attrs.media !== 'string') {
        return 'all';
    }

    const media = attrs.media.trim();
    return media ? media.replace(/\s+/g, ' ').toLowerCase() : 'all';
}

function normalizeStyleAttrsForKey(attrs: PostHTML.NodeAttributes) {
    return normalizeAttrsForKey(attrs, {
        booleanAttrs,
        skippedAttrs
    });
}

function buildStyleKey(attrs: PostHTML.NodeAttributes) {
    const keyObject: Record<string, string | boolean> = {
        type: normalizeStyleType(attrs),
        media: normalizeStyleMedia(attrs),
        ...normalizeStyleAttrsForKey(attrs)
    };

    return JSON.stringify(Object.fromEntries(Object.entries(keyObject).sort()));
}

function extractStyleTextContent(node: PostHTML.Node) {
    if (typeof node.content === 'string') {
        return node.content;
    }

    return extractTextContentFromNode(node);
}

/* Merge multiple <style> into one */
const mod: HtmlnanoModule = {
    default(tree) {
        const styleNodes: Record<string, PostHTML.Node> = {};

        tree.match({ tag: 'style' }, (node) => {
            if (typeof node !== 'object' || !node.tag || !node.content) return node;

            const nodeAttrs = node.attrs || {};
            // Skip <style scoped></style>
            // https://developer.mozilla.org/en/docs/Web/HTML/Element/style
            //
            // Also skip SRI, reasons are documented in "minifyJs" module
            if ('scoped' in nodeAttrs || 'integrity' in nodeAttrs) {
                return node;
            }

            if (isAmpBoilerplate(node)) {
                return node;
            }

            const styleKey = buildStyleKey(nodeAttrs);
            if (styleKey in styleNodes) {
                const styleContent = extractStyleTextContent(node);

                styleNodes[styleKey].content ??= [];
                styleNodes[styleKey].content.push(' ' + styleContent);
                return '' as unknown as PostHTML.Node; // Remove node
            }

            node.content = node.content || [];
            styleNodes[styleKey] = node;
            return node;
        });

        return tree;
    }
};

export default mod;
