import { init } from '../htmlnano.ts';

describe('removeEmptyElements', () => {
    it('should remove empty elements without attributes by default', () => {
        return init(
            '<div>hello<span><b></b></span></div>',
            '<div>hello</div>',
            { removeEmptyElements: true }
        );
    });

    it('should keep empty elements with attributes by default', () => {
        return init(
            '<div><span class="icon"></span></div>',
            '<div><span class="icon"></span></div>',
            { removeEmptyElements: true }
        );
    });

    it('should remove empty elements with attributes when enabled', () => {
        return init(
            '<div>hello<span class="icon"></span></div>',
            '<div>hello</div>',
            { removeEmptyElements: { removeWithAttributes: true } }
        );
    });

    it('should keep void elements', () => {
        return init(
            '<div><img></div>',
            '<div><img></div>',
            { removeEmptyElements: { removeWithAttributes: true } }
        );
    });

    it('should treat whitespace-only content as empty', () => {
        return init(
            '<div>text<span>   </span></div>',
            '<div>text</div>',
            { removeEmptyElements: true }
        );
    });
});
