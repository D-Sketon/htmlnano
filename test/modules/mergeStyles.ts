import { init } from '../htmlnano.ts';
import maxPreset from '../../dist/presets/max.mjs';

describe('mergeStyles', () => {
    const options = {
        mergeStyles: maxPreset.mergeStyles
    };

    it('should merge multiple <style> with the same "type" and "media" into one', () => {
        return init(
            '<style>h1 { color: red }</style>'
            + '<div>hello</div>'
            + '<style media="print">div { color: blue }</style>'
            + '<style>div { font-size: 20px }</style>'
            + '<style type="text/css" media="print">a {}</style>',

            '<style>h1 { color: red } div { font-size: 20px }</style>'
            + '<div>hello</div>'
            + '<style media="print">div { color: blue } a {}</style>',

            options
        );
    });

    it('should skip <style> with the "scoped" attribute', () => {
        const html = `<style>h1 { color: red }</style>
                      <div></div>
                      <style scoped="scoped">div { color: blue }</style>`;
        return init(
            html, html, options
        );
    });

    it('should skip <style> with SRI', () => {
        const html = `<style>h1 { color: red }</style>
                      <div></div>
                      <style integrity="example">div { color: blue }</style>`;
        return init(
            html, html, options
        );
    });

    it('should merge default and explicit type/media styles', () => {
        return init(
            '<style>h1 { color: red }</style>'
            + '<style type="text/css" media="all">div { color: blue }</style>',

            '<style>h1 { color: red } div { color: blue }</style>',

            options
        );
    });

    it('should merge styles with equivalent media spacing', () => {
        return init(
            '<style media="screen and (min-width: 600px)">h1 { color: red }</style>'
            + '<style media="screen   and (min-width: 600px)">div { color: blue }</style>',

            '<style media="screen and (min-width: 600px)">h1 { color: red } div { color: blue }</style>',

            options
        );
    });

    it('should not merge styles with different nonce values', () => {
        return init(
            '<style nonce="abc">h1 { color: red }</style>'
            + '<style>div { color: blue }</style>',

            '<style nonce="abc">h1 { color: red }</style>'
            + '<style>div { color: blue }</style>',

            options
        );
    });

    it('should not merge amp-custom and non-amp-custom styles', () => {
        return init(
            '<style amp-custom>h1 { color: red }</style>'
            + '<style>div { color: blue }</style>',

            '<style amp-custom="">h1 { color: red }</style>'
            + '<style>div { color: blue }</style>',

            options
        );
    });

    it('should preserve amp-custom', () => {
        return init(
            '<style amp-custom>h1 { color: red }</style>'
            + '<div>hello</div>'
            + '<style amp-custom>div { color: blue }</style>',

            '<style amp-custom="">h1 { color: red } div { color: blue }</style>'
            + '<div>hello</div>',

            options
        );
    });

    it('should ignore AMP boilerplate', () => {
        const html = `<style>h1 { color: red }</style>
                      <div></div>
                      <style amp-boilerplate="">div { color: blue }</style>`;
        return init(
            html, html, options
        );
    });

    it('should ignore amp4ads and amp4email boilerplate', () => {
        return init(
            '<style>h1 { color: red }</style>'
            + '<style amp4ads-boilerplate="">div { color: blue }</style>'
            + '<style>p { color: green }</style>'
            + '<style amp4email-boilerplate="">span { color: black }</style>',

            '<style>h1 { color: red } p { color: green }</style>'
            + '<style amp4ads-boilerplate="">div { color: blue }</style>'
            + '<style amp4email-boilerplate="">span { color: black }</style>',

            options
        );
    });
});
