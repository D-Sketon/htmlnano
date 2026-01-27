import { init } from '../htmlnano.ts';
import { describe, it } from 'mocha';

describe('sortAttributesWithLists', () => {
    it('alphabetical', () => {
        return init(
            '<a class="foo baz bar">click</a><a class="foo bar">click</a>',
            '<a class="bar baz foo">click</a><a class="bar foo">click</a>',
            {
                sortAttributesWithLists: 'alphabetical'
            }
        );
    });

    it('issue #180', () => {
        return init(
            '<img sizes="(min-width: 300px) 200px, 100px">',
            '<img sizes="(min-width: 300px) 200px, 100px">',
            {
                sortAttributesWithLists: 'alphabetical'
            }
        );
    });

    it('frequency', () => {
        return init(
            '<div class="foo baz bar"></div><div class="bar foo"></div>',
            '<div class="foo bar baz"></div><div class="foo bar"></div>',
            {
                sortAttributesWithLists: 'frequency'
            }
        );
    });

    it('attribute name casing', () => {
        return init(
            '<a CLASS="foo baz bar">click</a>',
            '<a CLASS="bar baz foo">click</a>',
            {
                sortAttributesWithLists: 'alphabetical'
            }
        );
    });

    it('true (alphabetical)', () => {
        return init(
            '<a class="foo baz bar">click</a><a class="foo bar">click</a>',
            '<a class="bar baz foo">click</a><a class="bar foo">click</a>',
            {
                sortAttributesWithLists: true
            }
        );
    });

    it('false (disabled)', () => {
        const input = '<a class="foo baz bar">click</a><a class="foo bar">click</a>';
        return init(
            input,
            input,
            {
                sortAttributesWithLists: false
            }
        );
    });

    it('invalid configuration', () => {
        const input = '<a class="foo baz bar">click</a><a class="foo bar">click</a>';
        return init(
            input,
            input,
            {
                // @ts-expect-error invalid type
                sortAttributesWithLists: 100
            }
        );
    });
});
