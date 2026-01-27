import type { HtmlnanoModule } from '../types';
import { isListAttribute } from './collapseAttributeWhitespace';

/** Deduplicate values inside list-like attributes (e.g. class, rel) */
const mod: HtmlnanoModule = {
    onAttrs() {
        return (attrs, node) => {
            const newAttrs = attrs;
            const tagName = node.tag ? node.tag.toLowerCase() : undefined;

            Object.keys(attrs).forEach((attrName) => {
                const attrNameLower = attrName.toLowerCase();
                if (!isListAttribute(attrNameLower, tagName)) {
                    return;
                }

                if (typeof attrs[attrName] !== 'string') {
                    return;
                }

                const attrValues = attrs[attrName].split(/\s/);
                const uniqeAttrValues = new Set();
                const deduplicatedAttrValues: string[] = [];

                attrValues.forEach((attrValue) => {
                    if (!attrValue) {
                        // Keep whitespaces
                        deduplicatedAttrValues.push('');
                        return;
                    }

                    if (uniqeAttrValues.has(attrValue)) {
                        return;
                    }

                    deduplicatedAttrValues.push(attrValue);
                    uniqeAttrValues.add(attrValue);
                });

                newAttrs[attrName] = deduplicatedAttrValues.join(' ');
            });

            return newAttrs;
        };
    }
};

export default mod;
