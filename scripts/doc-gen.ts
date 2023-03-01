import { DocCodeSpan, DocNodeKind } from '@microsoft/tsdoc';
import { DocBlock, DocNode, StringBuilder, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocFencedCode } from '@microsoft/tsdoc';
import { DocPlainText } from '@microsoft/tsdoc';
import { TextRange } from '@microsoft/tsdoc';
import { ParserContext, TSDocParser } from '@microsoft/tsdoc';
import { TSDocConfigFile } from '@microsoft/tsdoc-config';
import { readFileSync, writeFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import { dirname, join } from 'path';
import ts from 'typescript';

function parseComment(range: TextRange, filename: string) {
  const config: TSDocConfigFile = TSDocConfigFile.loadForFolder(dirname(filename));
  if (config.hasErrors) {
    console.log(config.getErrorSummary());
  }

  const configuration = new TSDocConfiguration();
  config.configureParser(configuration);

  const parser: TSDocParser = new TSDocParser(configuration);
  const parserContext: ParserContext = parser.parseRange(range);

  if (parserContext.log.messages.length > 0) {
    throw new Error('Syntax error: ' + parserContext.log.messages[0].text);
  }

  const output = new StringBuilder();

  renderNode(parserContext.docComment, output);

  return output.toString();
}

function renderNode(node: DocNode, output: StringBuilder) {
  if (node instanceof DocBlock) {
    switch (node.blockTag.tagName) {
      case '@title':
        output.append('##');
        break;
      case '@example':
        output.append('### Usage\n\n');
        output.append('```typescript');
        break;
    }

    renderContent(node.content, output);

    switch (node.blockTag.tagName) {
      case '@example':
        output.append('```\n');
        break;
    }
  }

  for (const child of node.getChildNodes()) {
    renderNode(child, output);
  }
}

function renderContent(node: DocNode, output: StringBuilder) {
  switch (node.kind) {
    case DocNodeKind.PlainText:
      output.append((node as DocPlainText).text);
      break;
    case DocNodeKind.FencedCode:
      output.append((node as DocFencedCode).code);
      break;
    case DocNodeKind.CodeSpan:
      output.append((node as DocCodeSpan).code);
      break;
    case DocNodeKind.SoftBreak:
      output.append('\n');
      break;
  }

  for (const child of node.getChildNodes()) {
    renderContent(child, output);
  }
}

// eslint-disable-next-line complexity
function isDeclarationKind(kind: ts.SyntaxKind): boolean {
  return (
    kind === ts.SyntaxKind.ArrowFunction ||
    kind === ts.SyntaxKind.BindingElement ||
    kind === ts.SyntaxKind.ClassDeclaration ||
    kind === ts.SyntaxKind.ClassExpression ||
    kind === ts.SyntaxKind.Constructor ||
    kind === ts.SyntaxKind.EnumDeclaration ||
    kind === ts.SyntaxKind.EnumMember ||
    kind === ts.SyntaxKind.ExportSpecifier ||
    kind === ts.SyntaxKind.FunctionDeclaration ||
    kind === ts.SyntaxKind.FunctionExpression ||
    kind === ts.SyntaxKind.GetAccessor ||
    kind === ts.SyntaxKind.ImportClause ||
    kind === ts.SyntaxKind.ImportEqualsDeclaration ||
    kind === ts.SyntaxKind.ImportSpecifier ||
    kind === ts.SyntaxKind.InterfaceDeclaration ||
    kind === ts.SyntaxKind.JsxAttribute ||
    kind === ts.SyntaxKind.MethodDeclaration ||
    kind === ts.SyntaxKind.MethodSignature ||
    kind === ts.SyntaxKind.ModuleDeclaration ||
    kind === ts.SyntaxKind.NamespaceExportDeclaration ||
    kind === ts.SyntaxKind.NamespaceImport ||
    kind === ts.SyntaxKind.Parameter ||
    kind === ts.SyntaxKind.PropertyAssignment ||
    kind === ts.SyntaxKind.PropertyDeclaration ||
    kind === ts.SyntaxKind.PropertySignature ||
    kind === ts.SyntaxKind.SetAccessor ||
    kind === ts.SyntaxKind.ShorthandPropertyAssignment ||
    kind === ts.SyntaxKind.TypeAliasDeclaration ||
    kind === ts.SyntaxKind.TypeParameter ||
    kind === ts.SyntaxKind.VariableDeclaration ||
    kind === ts.SyntaxKind.JSDocTypedefTag ||
    kind === ts.SyntaxKind.JSDocCallbackTag ||
    kind === ts.SyntaxKind.JSDocPropertyTag
  );
}

function getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
  const commentRanges: ts.CommentRange[] = [];

  switch (node.kind) {
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.TypeParameter:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.ParenthesizedExpression:
      commentRanges.push(...(ts.getTrailingCommentRanges(text, node.pos) || []));
      break;
  }
  commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));

  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter(
    comment =>
      text.charCodeAt(comment.pos + 1) === 0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 2) === 0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */
  );
}

function findComments(node: ts.Node, root: ts.Node, ranges: TextRange[]) {
  const buffer: string = root.getFullText();

  if (isDeclarationKind(node.kind)) {
    const comments = getJSDocCommentRanges(node, buffer);

    for (const comment of comments) {
      ranges.push(TextRange.fromStringRange(buffer, comment.pos, comment.end));
    }
  }

  node.forEachChild(child => findComments(child, root, ranges));
}

function parseTemplate(filename2: string) {
  Handlebars.registerHelper('tsdoc', function (f) {
    const filename = join(dirname(filename2), f);

    const program = ts.createProgram([filename], {});
    const source = program.getSourceFile(filename)!;

    const comments = Array.of<TextRange>();

    findComments(source, source, comments);

    const builder = new StringBuilder();

    for (const comment of comments) {
      builder.append(parseComment(comment, filename2));
    }

    return builder.toString();
  });

  const content = readFileSync(filename2, {
    encoding: 'utf8'
  });

  const template = Handlebars.compile(content, { noEscape: true });
  return template({});
}

function render(input: [string, string][]) {
  input.forEach(([from, to]) => {
    const document = parseTemplate(from);

    writeFileSync(join(dirname(process.argv[1]), to), document, {
      encoding: 'utf8'
    });
  });
}

render([
  ['./packages/binance/src/asset/readme.md', '../docs/reference/binance/asset.md'],
  ['./packages/binance/src/balance/readme.md', '../docs/reference/binance/balance.md'],
  [
    './packages/binance/src/instrument/readme.md',
    '../docs/reference/binance/instrument.md'
  ]
]);
