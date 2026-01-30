import type { HtmlnanoModule } from '../types';

const asciiWhitespace = new Set(['\t', '\n', '\f', '\r', ' ']);

function isAsciiWhitespace(char: string) {
    return asciiWhitespace.has(char);
}

function isAsciiDigit(char: string) {
    return char >= '0' && char <= '9';
}

function skipAsciiWhitespace(input: string, start: number) {
    let pos = start;
    while (pos < input.length && isAsciiWhitespace(input[pos])) {
        pos += 1;
    }
    return pos;
}

function minifyMetaRefreshValue(value: string): string | null {
    const input = value;
    let pos = skipAsciiWhitespace(input, 0);

    const timeStart = pos;
    while (pos < input.length && isAsciiDigit(input[pos])) {
        pos += 1;
    }
    if (pos === timeStart) return null;

    const time = input.slice(timeStart, pos);

    while (pos < input.length) {
        const ch = input[pos];
        if (isAsciiDigit(ch) || ch === '.') {
            pos += 1;
            continue;
        }
        break;
    }

    pos = skipAsciiWhitespace(input, pos);
    if (pos >= input.length) return time;

    const separator = input[pos];
    if (separator !== ';' && separator !== ',') return null;
    pos += 1;

    pos = skipAsciiWhitespace(input, pos);
    if (pos >= input.length) return time;

    let hasUrlPrefix = false;
    if (input[pos] === 'u' || input[pos] === 'U') {
        if (pos + 2 < input.length) {
            const maybeUrl = input.slice(pos, pos + 3);
            if (maybeUrl.toLowerCase() === 'url') {
                let prefixPos = skipAsciiWhitespace(input, pos + 3);
                if (prefixPos < input.length && input[prefixPos] === '=') {
                    prefixPos = skipAsciiWhitespace(input, prefixPos + 1);
                    hasUrlPrefix = true;
                    pos = prefixPos;
                }
            }
        }
    }

    if (pos >= input.length) return time;

    const firstUrlChar = input[pos];
    if (firstUrlChar === '"' || firstUrlChar === '\'') {
        if (!hasUrlPrefix) return null;

        const quote = firstUrlChar;
        const urlStart = pos + 1;
        const quoteIndex = input.indexOf(quote, urlStart);
        const url = quoteIndex === -1 ? input.slice(urlStart) : input.slice(urlStart, quoteIndex);

        if (!url) return time;
        const closingQuote = quoteIndex === -1 ? '' : quote;

        return `${time}${separator} URL=${quote}${url}${closingQuote}`;
    }

    const url = input.slice(pos).trim();
    if (!url) return time;

    return `${time}${separator} ${url}`;
}

function isMetaRefresh(attrs: Record<string, string | boolean | void>, tagName?: string): boolean {
    if (!tagName || tagName.toLowerCase() !== 'meta') return false;

    const httpEquiv = attrs['http-equiv'];
    if (typeof httpEquiv !== 'string') return false;

    return httpEquiv.trim().toLowerCase() === 'refresh';
}

const mod: HtmlnanoModule = {
    onAttrs() {
        return (attrs, node) => {
            if (!isMetaRefresh(attrs, node.tag)) return attrs;

            const content = attrs.content;
            if (typeof content !== 'string') return attrs;

            const minified = minifyMetaRefreshValue(content);
            if (minified !== null && minified !== content) {
                attrs.content = minified;
            }

            return attrs;
        };
    }
};

export default mod;
