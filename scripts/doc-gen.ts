import { DocNodeKind } from '@microsoft/tsdoc';
import { DocNodeTransforms } from '@microsoft/tsdoc';
import {
  DocBlock,
  DocNode,
  DocSection,
  StringBuilder,
  TSDocConfiguration
} from '@microsoft/tsdoc';
import { DocParagraph } from '@microsoft/tsdoc';
import { DocPlainText } from '@microsoft/tsdoc';
import { ParserContext, TSDocParser } from '@microsoft/tsdoc';
import { TSDocConfigFile } from '@microsoft/tsdoc-config';
import { readFileSync, writeFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import { dirname, join } from 'path';

function parseComment(filename: string) {
  const config: TSDocConfigFile = TSDocConfigFile.loadForFolder(dirname(process.argv[2]));
  if (config.hasErrors) {
    console.log(config.getErrorSummary());
  }

  const configuration = new TSDocConfiguration();
  config.configureParser(configuration);

  const parser: TSDocParser = new TSDocParser(configuration);

  const content = readFileSync(filename, {
    encoding: 'utf8'
  })
    .replace(/^import.*$/gm, '')
    .replace(/^export.*$/gm, '');

  const parserContext: ParserContext = parser.parseString(content);

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
    }

    renderContent(node.content, output);
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
    case 'SoftBreak':
      output.append('\n');
      break;
  }

  for (const child of node.getChildNodes()) {
    renderContent(child, output);
  }
}

function parseTemplate(filename: string) {
  const content = readFileSync(filename, {
    encoding: 'utf8'
  });

  const template = Handlebars.compile(content);
  return template({});
}

Handlebars.registerHelper('tsdoc', function (filename) {
  return parseComment(join(dirname(process.argv[2]), filename));
});

writeFileSync(
  join(dirname(process.argv[1]), process.argv[3]),
  parseTemplate(process.argv[2])
);
