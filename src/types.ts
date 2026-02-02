import type PostHTML from 'posthtml';
import type { MinifyOptions } from 'terser';
import type { Options as CssNanoOptions } from 'cssnano';
import type { Config as SvgoOptimizeOptions } from 'svgo';
import type { UserDefinedOptions as PurgeCSSOptions } from 'purgecss';

export type PostHTMLTreeLike = [PostHTML.Node] & PostHTML.NodeAPI & {
    options?: {
        quoteAllAttributes?: boolean | undefined;
        quoteStyle?: 0 | 1 | 2 | undefined;
        replaceQuote?: boolean | undefined;
    } | undefined;

    render(): string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- posthtml render options are untyped
    render(node: PostHTML.Node | PostHTMLTreeLike, renderOptions?: any): string;
};

type MaybeArray<T> = T | Array<T>;

export type PostHTMLNodeLike = PostHTML.Node | string;

export type HtmlnanoTemplateRule = {
    tag: string;
    attrs?: Record<string, string | boolean | void>;
};
export type MinifyHtmlTemplateOptions = boolean | HtmlnanoTemplateRule[];

export interface HtmlnanoOptions {
    skipConfigLoading?: boolean;
    configPath?: string;
    skipInternalWarnings?: boolean;
    collapseAttributeWhitespace?: boolean;
    collapseBooleanAttributes?: {
        amphtml?: boolean;
    };
    collapseWhitespace?: 'conservative' | 'all' | 'aggressive';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- custom options depend on consumer
    custom?: MaybeArray<(tree: PostHTMLTreeLike, options?: any) => (PostHTML.Node | PostHTMLTreeLike)>;
    deduplicateAttributeValues?: boolean;
    minifyUrls?: URL | string | false;
    mergeStyles?: boolean;
    mergeScripts?: boolean;
    minifyCss?: CssNanoOptions | boolean;
    minifyHtmlTemplate?: MinifyHtmlTemplateOptions;
    minifyConditionalComments?: boolean;
    minifyJs?: MinifyOptions | boolean;
    minifyJson?: boolean;
    minifyAttributes?: boolean | {
        metaContent?: boolean;
        redundantWhitespaces?: 'safe' | 'agressive' | false;
    };
    minifySvg?: SvgoOptimizeOptions | boolean;
    normalizeAttributeValues?: boolean;
    removeAttributeQuotes?: boolean | {
        force?: boolean;
    };
    removeComments?: boolean | RegExp | ((comment: string) => boolean) | string;
    removeEmptyAttributes?: boolean;
    removeEmptyElements?: boolean | {
        removeWithAttributes?: boolean;
    };
    removeRedundantAttributes?: boolean;
    removeOptionalTags?: boolean;
    removeUnusedCss?: boolean
        | ({ tool: 'purgeCSS' } & Omit<PurgeCSSOptions, 'content' | 'css' | 'extractors'>)
        | {
            banner?: boolean;
            csspath?: string;
            htmlroot?: string;
            ignore?: (string | RegExp)[];
            inject?: string;
            jsdom?: object;
            media?: string[];
            report?: boolean;
            strictSSL?: boolean;
            timeout?: number;
            uncssrc?: string;
            userAgent?: string;
        };
    sortAttributes?: boolean | 'alphabetical' | 'frequency';
    sortAttributesWithLists?: boolean | 'alphabetical' | 'frequency';
}

export interface HtmlnanoPreset extends Omit<HtmlnanoOptions, 'skipConfigLoading' | 'configPath'> { }

export type HtmlnanoPredefinedPreset = 'safe' | 'ampSafe' | 'max';
export type HtmlnanoPredefinedPresets = Record<HtmlnanoPredefinedPreset, HtmlnanoPreset>;

export type HtmlnanoOptionsConfigFile = Omit<HtmlnanoOptions, 'skipConfigLoading' | 'configPath'> & {
    preset?: HtmlnanoPredefinedPreset;
};

export type HtmlnanoModuleAttrsHandler = (attrs: Record<string, string | boolean | void>, node: PostHTML.Node) => Record<string, string | boolean | void>;
export type HtmlnanoModuleContentHandler = (content: Array<PostHTMLNodeLike>, node: PostHTML.Node) => MaybeArray<PostHTMLNodeLike>;
export type HtmlnanoModuleNodeHandler = (node: PostHTMLNodeLike) => PostHTML.Node | string;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- match any functions deliberately
type OptionalOptions<T> = T extends boolean | string | Function | number | null | undefined
    ? T
    : T extends object
        ? Partial<T>
        : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- module options default to any
export type HtmlnanoModule<Options = any> = {
    onAttrs?: (options: Partial<HtmlnanoOptions>, moduleOptions: OptionalOptions<Options>) => HtmlnanoModuleAttrsHandler;
    onContent?: (options: Partial<HtmlnanoOptions>, moduleOptions: OptionalOptions<Options>) => HtmlnanoModuleContentHandler;
    onNode?: (options: Partial<HtmlnanoOptions>, moduleOptions: OptionalOptions<Options>) => HtmlnanoModuleNodeHandler;
    default?: (
        tree: PostHTMLTreeLike,
        options: Partial<HtmlnanoOptions>,
        moduleOptions: OptionalOptions<Options>
    ) => PostHTMLTreeLike | Promise<PostHTMLTreeLike>;
};
