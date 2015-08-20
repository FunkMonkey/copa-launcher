import { Transform } from "stream";

export default class BlockUntilResolvedTransform extends Transform {

  constructor( options ) {
    super( options );

    this._promise = options.promise;
    this._requested = false;
    this._resolved = false;
    this._queue = [];
  }

  _transform( chunk, encoding, done ) {
    if( this._resolved ) {
      done( null, chunk );
    }
    else if ( this._requested ) {
      this._queue.push( chunk );
      done();
    } else {
      this._requested = true;
      this._queue.push( chunk );

      this._promise.then( () => {
        this._resolved = true;

        this._queue.forEach( queuedChunk => this.push( queuedChunk ) );
        this._queue.length = 0;
        done();

      } ).catch( error => done( error ) );
    }
  }
}
