import type { HtmlnanoModule } from '../types';

const rNodeAttrsTypeJson = /(?:\/|\+)json$/i;

const getMimeType = (type: string) => type.split(';', 1)[0]?.trim();

const mod: HtmlnanoModule = {
    onContent() {
        return (content, node) => {
            // Skip SRI, reasons are documented in "minifyJs" module
            if (node.attrs && 'integrity' in node.attrs) {
                return content;
            }

            const nodeType = node.attrs && typeof node.attrs.type === 'string'
                ? getMimeType(node.attrs.type)
                : undefined;

            if (nodeType && rNodeAttrsTypeJson.test(nodeType)) {
                try {
                    const jsonContent = typeof content === 'string'
                        ? content
                        : Array.isArray(content) && content.every(item => typeof item === 'string')
                            ? content.join('')
                            : null;

                    if (jsonContent === null) {
                        return content;
                    }

                    return [JSON.stringify(JSON.parse(jsonContent))];
                } catch {
                    // Invalid JSON
                }
            }

            return content;
        };
    }
};

export default mod;
