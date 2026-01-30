import { init } from '../htmlnano.ts';

describe('minifyAttributes', () => {
    const options = {
        minifyAttributes: true
    };

    context('<meta http-equiv="refresh" content=...>', () => {
        it('should remove empty url', () => {
            return init(
                '<meta http-equiv="refresh" content="5; url=">',
                '<meta http-equiv="refresh" content="5">',
                options
            );
        });

        it('should drop url= prefix', () => {
            return init(
                '<meta http-equiv="refresh" content="5; url=http://example.com/">',
                '<meta http-equiv="refresh" content="5; http://example.com/">',
                options
            );
        });

        it('should preserve quoted urls after URL=', () => {
            return init(
                '<meta http-equiv="refresh" content="5; url=\'/next path \'">',
                '<meta http-equiv="refresh" content="5; URL=\'/next path \'">',
                options
            );
        });

        it('should handle whitespace, commas, and case-insensitive url', () => {
            return init(
                '<meta http-equiv="REFRESH" content=" 10 , URL = /next ">',
                '<meta http-equiv="REFRESH" content="10, /next">',
                options
            );
        });

        it('should drop fractional time', () => {
            return init(
                '<meta http-equiv="refresh" content="5.9; url=/next">',
                '<meta http-equiv="refresh" content="5; /next">',
                options
            );
        });

        it('should skip non-refresh meta', () => {
            return init(
                '<meta http-equiv="content-type" content="5; url=http://example.com/">',
                '<meta http-equiv="content-type" content="5; url=http://example.com/">',
                options
            );
        });

        it('should skip non-meta tags', () => {
            return init(
                '<div http-equiv="refresh" content="5; url=http://example.com/"></div>',
                '<div http-equiv="refresh" content="5; url=http://example.com/"></div>',
                options
            );
        });

        it('should skip invalid refresh content', () => {
            return init(
                '<meta http-equiv="refresh" content="soon; url=/next">',
                '<meta http-equiv="refresh" content="soon; url=/next">',
                options
            );
        });

        it('should skip quoted urls without URL= prefix', () => {
            return init(
                '<meta http-equiv="refresh" content="5; \'/next\'">',
                '<meta http-equiv="refresh" content="5; \'/next\'">',
                options
            );
        });
    });
});
