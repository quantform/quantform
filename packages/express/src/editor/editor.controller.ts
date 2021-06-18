import { Controller, Get, JsonController, Param, Req, Res } from 'routing-controllers';
import { Service } from 'typedi';
import * as path from 'path';

@Controller('/editor')
@Service()
export class EditorController {
  @Get('/:name/:session')
  get(
    @Param('name') name: string,
    @Param('session') session: string,
    @Req() req: any,
    @Res() res: any
  ) {
    console.log('re');
    res.sendFile(path.join(__dirname + '/../editor/build/index.html'));
  }
}
