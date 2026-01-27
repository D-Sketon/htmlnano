import { expect } from 'expect';
import { init } from '../htmlnano.ts';
import type { PostHTMLTreeLike, HtmlnanoOptions } from '../../src/types.js';

describe('custom', () => {
    it('should apply a custom minifier module', () => {
        return init(
            '<div><span>hello</span></div>',
            '<div>hello</div>',
            { custom: getRemoveTagFunction('span') }
        );
    });

    it('should apply multiple custom minifier modules', () => {
        return init(
            '<div><span>hello</span></div>',
            '<div>hello</div>',
            { custom: [getRemoveTagFunction('span'), getRemoveTagFunction('span')] }
        );
    });

    it('should ignore falsy custom modules', () => {
        const customModules = [null, getRemoveTagFunction('span'), false] as unknown as
            HtmlnanoOptions['custom'];

        return init(
            '<div><span>hello</span></div>',
            '<div>hello</div>',
            { custom: customModules }
        );
    });
});

function getRemoveTagFunction(tag: string) {
    return (tree: PostHTMLTreeLike, options?: HtmlnanoOptions): PostHTMLTreeLike => {
        expect(options?.custom).toBeTruthy();

        tree.match({ tag }, (node) => {
            // @ts-expect-error tag should be a string
            node.tag = false;
            return node;
        });

        return tree;
    };
}
