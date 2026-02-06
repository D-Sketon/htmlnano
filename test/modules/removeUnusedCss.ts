import { init } from '../htmlnano.ts';

describe('removeUnusedCss (uncss)', function () {
    this.timeout(3000);

    const options = {
        removeUnusedCss: {
            tool: 'uncss' as const
        }
    };
    const html = `<div><style>
        div.b {
            padding: 10px;
            border-radius: 10px;
        }
        .b {
            color: red;
        }
        .c {
            color: #123;
        }
    </style></div><p class="b">hello</p><style>.d{margin:auto}</style>`;

    it('should remove unused CSS inside <style>', () => {
        return init(
            html,
            `<div><style>
        .b {
            color: red;
        }
    </style></div><p class="b">hello</p>`,
            options
        );
    });

    it('should pass options to uncss', () => {
        return init(
            html,
            `<div><style>
        .b {
            color: red;
        }
        .c {
            color: #123;
        }
    </style></div><p class="b">hello</p>`,
            {
                removeUnusedCss: {
                    tool: 'uncss',
                    ignore: ['.c']
                }
            }
        );
    });

    it('should work with minifyCss', () => {
        return init(
            html,
            '<div><style>.b{color:red}</style></div><p class="b">hello</p>',
            {
                removeUnusedCss: options.removeUnusedCss,
                minifyCss: {}
            }
        );
    });

    it('should ignore amp boilerplate styles', () => {
        const ampHtml = '<style amp-boilerplate="">.unused{color:red}</style><div></div>';

        return init(
            ampHtml,
            ampHtml,
            {
                removeUnusedCss: options.removeUnusedCss
            }
        );
    });

    it('should preserve CDATA wrappers when removing rules', () => {
        const cdataHtml = '<div class="b"><style><![CDATA[.b{color:red}.c{color:blue}]]></style></div>';

        return init(
            cdataHtml,
            '<div class="b"><style><![CDATA[.b{color:red}]]></style></div>',
            options
        );
    });

    it('should skip non-css style types', () => {
        const lessHtml = '<style type="text/less">.unused{color:red}</style><div></div>';

        return init(
            lessHtml,
            lessHtml,
            options
        );
    });
});

describe('removeUnusedCss (purgeCSS)', function () {
    const options = {
        removeUnusedCss: {
            tool: 'purgeCSS' as const
        }
    };
    const html = `<div><style>
        div.r {
            padding: 10px;
            border-radius: 10px;
        }
        .b {
            color: red;
        }
        .c {
            color: #123;
        }
    </style></div><p class="b">hello</p><style>.d{margin:auto}</style>`;

    it('should remove unused CSS inside <style>', () => {
        return init(
            html,
            `<div><style>
        .b {
            color: red;
        }
    </style></div><p class="b">hello</p>`,
            options
        );
    });

    it('should pass options to purgeCSS', () => {
        return init(
            html,
            `<div><style>
        .b {
            color: red;
        }
        .c {
            color: #123;
        }
    </style></div><p class="b">hello</p>`,
            {
                removeUnusedCss: {
                    tool: 'purgeCSS',
                    safelist: ['c']
                }
            }
        );
    });

    it('should use purgeCSS by default when tool is omitted', () => {
        return init(
            html,
            `<div><style>
        .b {
            color: red;
        }
    </style></div><p class="b">hello</p>`,
            {
                removeUnusedCss: {
                    ignore: ['.c']
                }
            }
        );
    });

    it('should work with minifyCss', () => {
        return init(
            html,
            '<div><style>.b{color:red}</style></div><p class="b">hello</p>',
            {
                removeUnusedCss: options.removeUnusedCss,
                minifyCss: {}
            }
        );
    });

    it('should keep tag selectors based on the HTML', () => {
        const tagHtml = '<section><style>section{color:red}.unused{color:blue}</style></section><section>hi</section>';

        return init(
            tagHtml,
            '<section><style>section{color:red}</style></section><section>hi</section>',
            options
        );
    });

    it('should keep selectors from class names with newlines', () => {
        const newlineHtml = '<div class="a\nb"><style>.a{color:red}.b{color:blue}.c{color:green}</style></div>';

        return init(
            newlineHtml,
            '<div class="a\nb"><style>.a{color:red}.b{color:blue}</style></div>',
            options
        );
    });

    it('should skip non-css style types', () => {
        const lessHtml = '<style type="text/less">.unused{color:red}</style><div></div>';

        return init(
            lessHtml,
            lessHtml,
            options
        );
    });
});
