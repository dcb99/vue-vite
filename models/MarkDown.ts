export interface MultipleMarkdown {
    cssClass: string;
    markdown: FlatMarkdown[]
}

type MarkdownTypes = "BoldMarkdown" | "ItalicMarkdown" | "LinkMarkdown" | "LiteralMarkdown";

export interface FlatMarkdown {
    type: MarkdownTypes;
}