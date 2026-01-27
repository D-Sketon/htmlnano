import { init } from '../htmlnano.ts';
import safePreset from '../../dist/presets/safe.mjs';

describe('collapseAttributeWhitespace', () => {
    const options = {
        collapseAttributeWhitespace: safePreset.collapseAttributeWhitespace
    };

    it('should collapse whitespaces inside list-like attributes', () => {
        return init(
            '<a class=" foo  bar baz ">click</a>',
            '<a class="foo bar baz">click</a>',
            options
        );
    });

    it('should collapse whitespaces inside link sizes attribute', () => {
        return init(
            '<link rel="icon" sizes=" 16x16  32x32 " href="/icon.png">',
            '<link rel="icon" sizes="16x16 32x32" href="/icon.png">',
            options
        );
    });

    it('should not alter img sizes attribute', () => {
        return init(
            '<img sizes=" 100vw  50vw " src="foo.jpg">',
            '<img sizes=" 100vw  50vw " src="foo.jpg">',
            options
        );
    });

    it('should collapse whitespaces inside single value attributes', () => {
        return init(
            '<a href="   https://example.com" style="display: none     ">click</a>',
            '<a href="https://example.com" style="display: none">click</a>',
            options
        );
    });

    it('should not alter non-list-like nor single value attributes', () => {
        return init(
            '<a id=" foo  bar " href=" baz  bar ">click</a>',
            '<a id=" foo  bar " href="baz  bar">click</a>',
            options
        );
    });

    it('should trim event handler attributes without collapsing inner whitespace', () => {
        return init(
            '<button onclick="  foo  bar  ">click</button>',
            '<button onclick="foo  bar">click</button>',
            options
        );
    });

    it('should not trim single value attributes on unrelated tags', () => {
        return init(
            '<div href="  https://example.com  ">click</div>',
            '<div href="  https://example.com  ">click</div>',
            options
        );
    });
});
