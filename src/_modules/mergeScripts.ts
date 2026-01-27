import type PostHTML from 'posthtml';
import type { HtmlnanoModule } from '../types';
import { extractTextContentFromNode } from '../helpers';

type ScriptTracking = {
    mergedScriptNodes: WeakSet<PostHTML.Node>;
    removedScriptNodes: WeakSet<PostHTML.Node>;
};

function normalizeAsyncAttr(attrs: PostHTML.NodeAttributes) {
    if (attrs && attrs.async === '') {
        (attrs as Record<string, string | boolean>).async = true;
    }
}

function getScriptType(attrs: PostHTML.NodeAttributes) {
    return attrs.type || 'text/javascript';
}

function isMergeableScriptType(type: string) {
    return type === 'text/javascript' || type === 'application/javascript';
}

function buildScriptKey(attrs: PostHTML.NodeAttributes, scriptType: string, scriptSrcIndex: number) {
    return JSON.stringify({
        id: attrs.id,
        class: attrs.class,
        type: scriptType,
        defer: attrs.defer !== undefined,
        async: attrs.async !== undefined,
        index: scriptSrcIndex
    });
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

            if (scriptContent.slice(-1) !== ';') {
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
