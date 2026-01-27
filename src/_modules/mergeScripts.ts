import type PostHTML from 'posthtml';
import type { HtmlnanoModule } from '../types';
import { extractTextContentFromNode } from '../helpers';

type ScriptTracking = {
    mergedScriptNodes: WeakSet<PostHTML.Node>;
    removedScriptNodes: WeakSet<PostHTML.Node>;
};

function normalizeAsyncAttr(attrs: PostHTML.NodeAttributes) {
    if (!attrs) {
        return;
    }

    if (attrs.async === '') {
        (attrs as Record<string, string | boolean>).async = true;
    }

    if (attrs.nomodule === '') {
        (attrs as Record<string, string | boolean>).nomodule = true;
    }
}

function getScriptType(attrs: PostHTML.NodeAttributes) {
    const type = attrs.type || 'text/javascript';

    return typeof type === 'string' ? type.toLowerCase() : 'text/javascript';
}

function isMergeableScriptType(type: string) {
    return type === 'text/javascript' || type === 'application/javascript';
}

const booleanAttrs = new Set(['async', 'defer', 'nomodule']);

function normalizeScriptAttrsForKey(attrs: PostHTML.NodeAttributes, scriptType: string) {
    const normalized: Record<string, string | boolean> = {
        type: scriptType
    };

    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'src' || key === 'integrity' || key === 'type') {
            continue;
        }

        if (value === undefined) {
            continue;
        }

        if (booleanAttrs.has(key)) {
            normalized[key] = true;
            continue;
        }

        normalized[key] = value as string | boolean;
    }

    return normalized;
}

function buildScriptKey(attrs: PostHTML.NodeAttributes, scriptType: string, scriptSrcIndex: number) {
    const normalizedAttrs = normalizeScriptAttrsForKey(attrs, scriptType);
    const keyObject: Record<string, string | boolean | number> = {
        index: scriptSrcIndex,
        ...normalizedAttrs
    };
    const sortedKeys = Object.keys(keyObject).sort();
    const sortedKeyObject: Record<string, string | boolean | number> = {};

    for (const key of sortedKeys) {
        sortedKeyObject[key] = keyObject[key];
    }

    return JSON.stringify(sortedKeyObject);
}

function endsWithLineComment(scriptContent: string) {
    const lastNewlineIndex = Math.max(
        scriptContent.lastIndexOf('\n'),
        scriptContent.lastIndexOf('\r')
    );
    const lastLine = lastNewlineIndex === -1
        ? scriptContent
        : scriptContent.slice(lastNewlineIndex + 1);

    return /\/\/.*$/.test(lastLine);
}

function mergeScriptNodes(
    scriptNodesIndex: Record<string, PostHTML.Node[]>,
    tracking: ScriptTracking
) {
    for (const scriptNodes of Object.values(scriptNodesIndex)) {
        if (scriptNodes.length < 2) {
            continue;
        }

        const lastScriptNode = scriptNodes.pop()!;
        tracking.mergedScriptNodes.add(lastScriptNode);

        scriptNodes.reverse().forEach((scriptNode) => {
            let scriptContent = extractTextContentFromNode(scriptNode).trim();

            if (!scriptContent) {
                tracking.removedScriptNodes.add(scriptNode);
                // @ts-expect-error -- remove node
                scriptNode.tag = false;
                scriptNode.content = [];
                return;
            }

            if (endsWithLineComment(scriptContent)) {
                scriptContent += '\n;';
            } else if (scriptContent.slice(-1) !== ';') {
                scriptContent += ';';
            }

            lastScriptNode.content = lastScriptNode.content || [];
            lastScriptNode.content.unshift(scriptContent);

            tracking.removedScriptNodes.add(scriptNode);
            // @ts-expect-error -- remove node
            scriptNode.tag = false;
            scriptNode.content = [];
        });
    }
}

/* Merge multiple <script> into one */
const mod: HtmlnanoModule = {
    default(tree) {
        const scriptNodesIndex: Record<string, PostHTML.Node[]> = {};
        const tracking: ScriptTracking = {
            mergedScriptNodes: new WeakSet<PostHTML.Node>(),
            removedScriptNodes: new WeakSet<PostHTML.Node>()
        };
        let scriptSrcIndex = 1;

        tree.match({ tag: 'script' }, (node) => {
            const nodeAttrs = node.attrs || {};
            normalizeAsyncAttr(nodeAttrs);
            if (
                'src' in nodeAttrs
                // Skip SRI, reasons are documented in "minifyJs" module
                || 'integrity' in nodeAttrs
            ) {
                scriptSrcIndex++;
                return node;
            }

            const scriptType = getScriptType(nodeAttrs);
            if (!isMergeableScriptType(scriptType)) {
                return node;
            }

            const scriptKey = buildScriptKey(nodeAttrs, scriptType, scriptSrcIndex);
            if (!scriptNodesIndex[scriptKey]) {
                scriptNodesIndex[scriptKey] = [];
            }

            scriptNodesIndex[scriptKey].push(node);
            return node;
        });

        mergeScriptNodes(scriptNodesIndex, tracking);
        return tree;
    }
};

export default mod;
