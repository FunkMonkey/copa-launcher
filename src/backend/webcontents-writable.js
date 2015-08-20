import { Writable } from "stream";

export default class WebContentsWritable extends Writable {

  constructor( options ) {
    super( options );
    this._getWindow = options.getWindow;
    this._args = options.args || [];
    this._window = null;
  }

  _write( chunk, encoding, done ) {
    if( !this._window )
      this._window = this._getWindow();

    this._window.webContents.send( ...this._args, chunk );
    done();
  }
}
