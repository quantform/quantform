export class Logger {
  public static info = console && console.info && console.info.bind(console);
  public static log = console && console.log && console.log.bind(console);
  public static debug = console && console.debug && console.debug.bind(console);
  public static warn = console && console.warn && console.warn.bind(console);
  public static error = console && console.error && console.error.bind(console);
  public static assert = console && console.assert && console.assert.bind(console);
  public static trace = console && console.trace && console.trace.bind(console);
}
