import { ParserContext, TSDocParser } from '@microsoft/tsdoc';
import { readFileSync, writeFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import { dirname, join } from 'path';

function parseComment(filename: string) {
  const parser: TSDocParser = new TSDocParser();

  const content = readFileSync(filename, {
    encoding: 'utf8'
  })
    .replace(/^import.*$/gm, '')
    .replace(/^export.*$/gm, '');

  const parserContext: ParserContext = parser.parseString(content);

  if (parserContext.log.messages.length > 0) {
    throw new Error('Syntax error: ' + parserContext.log.messages[0].text);
  }

  return parserContext.docComment.emitAsTsdoc();
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
