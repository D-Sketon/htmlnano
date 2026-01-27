import { init } from '../htmlnano.ts';
import safePreset from '../../dist/presets/safe.mjs';

describe('deduplicateAttributeValues', () => {
    const options = {
        deduplicateAttributeValues: safePreset.deduplicateAttributeValues
    };

    it('it remove duplicate values from list-like attributes', () => {
        return init(
            '<a class=" foo  bar foo ">click</a>',
            '<a class=" foo  bar ">click</a>',
            options
        );
    });

    it('should not alter non-list-like attributes', () => {
        return init(
            '<a id="foo foo" href="bar  bar">click</a>',
            '<a id="foo foo" href="bar  bar">click</a>',
            options
        );
    });

    it('should preserve whitespace around middle duplicates', () => {
        return init(
            '<a class="foo  foo   bar">click</a>',
            '<a class="foo    bar">click</a>',
            options
        );
    });

    it('should deduplicate rel attribute values', () => {
        return init(
            '<link rel="nofollow noopener nofollow">',
            '<link rel="nofollow noopener">',
            options
        );
    });
});
