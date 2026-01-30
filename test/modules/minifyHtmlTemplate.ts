import { init } from '../htmlnano.ts';

describe('minifyHtmlTemplate', () => {
    it('should minify script templates using built-in rules', () => {
        return init(
            `<script type="Text/X-Handlebars-Template; charset=utf-8">
                <div class="entry">
                    <h1>{{title}}</h1>
                </div>
            </script>`,
            '<script type="Text/X-Handlebars-Template; charset=utf-8"><div class="entry"> <h1>{{title}}</h1> </div></script>',
            {
                collapseWhitespace: 'conservative',
                minifyHtmlTemplate: true
            }
        );
    });

    it('should replace default rules when custom rules are provided', () => {
        return init(
            '<script type="text/x-handlebars-template"> <div> One </div> </script><template id="tpl"> <div> Two </div> </template>',
            '<script type="text/x-handlebars-template"> <div> One </div> </script><template id="tpl"><div> Two </div></template>',
            {
                collapseWhitespace: 'conservative',
                minifyHtmlTemplate: [{ tag: 'template', attrs: { id: 'tpl' } }]
            }
        );
    });
});
