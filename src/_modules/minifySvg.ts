import { optionalImport } from '../helpers';
import type { HtmlnanoModule } from '../types';
import type { Config as SvgoConfig } from 'svgo';

/** Minify SVG with SVGO */
const mod: HtmlnanoModule<SvgoConfig> = {
    async default(tree, options, svgoOptions) {
        const svgo = await optionalImport<typeof import('svgo')>('svgo');

        if (!svgo) return tree;

        const resolvedSvgoOptions = resolveSvgoOptions(svgoOptions);
        const svgoOptionsWithDefaults = applySvgoDefaults(resolvedSvgoOptions);

        tree.match({ tag: 'svg' }, (node) => {
            const svgStr = tree.render(node, { closingSingleTag: 'slash', quoteAllAttributes: true });

            try {
                const result = svgo.optimize(svgStr, svgoOptionsWithDefaults);
                // @ts-expect-error -- remove this node
                node.tag = false;
                node.attrs = {};
                // result.data is a string, we need to cast it to an array
                node.content = [result.data];
                return node;
            } catch (error) {
                const isSvgoParserError = Boolean(
                    error
                    && typeof error === 'object'
                    && 'name' in error
                    && error.name === 'SvgoParserError'
                );
                if (!isSvgoParserError) {
                    if (!options.skipInternalWarnings) {
                        console.error('htmlnano fails to minify the svg:');
                        console.error(error);
                    }
                    let fallbackSvgStr = svgStr;
                    try {
                        fallbackSvgStr = svgo.optimize(svgStr, { plugins: [] }).data;
                    } catch {
                        fallbackSvgStr = svgStr;
                    }
                    // @ts-expect-error -- remove this node
                    node.tag = false;
                    node.attrs = {};
                    node.content = [fallbackSvgStr];
                }
                // We return the node as-is
                return node;
            }
        });

        return tree;
    }
};

export default mod;

function resolveSvgoOptions(svgoOptions: SvgoConfig | true | null | undefined): SvgoConfig {
    if (!svgoOptions || svgoOptions === true) {
        return {};
    }
    return svgoOptions;
}

function applySvgoDefaults(svgoOptions: SvgoConfig): SvgoConfig {
    return {
        ...svgoOptions,
        multipass: svgoOptions.multipass ?? true
    };
}
