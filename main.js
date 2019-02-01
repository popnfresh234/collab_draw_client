const app = ( function () {
  const WS_ADDRESS = 'ws://localhost:8080/';
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const GRID_COLOR = 'rgb(206, 206, 206)';
  const collabCanvas = document.getElementById( 'collab_canvas' );
  const collabCtx = collabCanvas.getContext( '2d' );
  let socket = null;
  const mouseStatus = {
    down: false,
  };

  const drawLine = ( pointsArray, context ) => {
    const ctx = context;
    ctx.beginPath();
    ctx.lineWidth = pointsArray[0].lineWidth;
    ctx.strokeStyle = pointsArray[0].strokeStyle;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.moveTo(
      pointsArray[0].normalizedX * WIDTH,
      pointsArray[0].normalizedY * HEIGHT,
    );
    for ( let i = 0; i < pointsArray.length - 1; i += 1 ) {
      ctx.lineTo(
        pointsArray[i + 1].normalizedX * WIDTH,
        pointsArray[i + 1].normalizedY * HEIGHT,
      );
    }
    ctx.stroke();
    ctx.closePath();
  };

  const drawGrid = ( context ) => {
    const canvasContext = context;
    for ( let x = 0.5; x < WIDTH; x += 25 ) {
      context.moveTo( x, 0 );
      context.lineTo( x, HEIGHT );
    }
    for ( let y = 0.5; y < HEIGHT; y += 25 ) {
      context.moveTo( 0, y );
      context.lineTo( WIDTH, y );
    }
    canvasContext.strokeStyle = GRID_COLOR;
    canvasContext.stroke();
  };

  const setup = () => {
    collabCanvas.width = WIDTH;
    collabCanvas.height = HEIGHT;
    socket = new WebSocket( WS_ADDRESS );
    socket.onmessage = ( msg ) => {
      const dataMsg = JSON.parse( msg.data );
      const msgLookup = {
        line: () => drawLine( dataMsg.data, collabCtx ),
        grid: () => drawGrid( collabCtx ),
      };
      const fn = msgLookup[dataMsg.type];
      if ( fn ) fn();
    };
  };

  const sendData = ( data ) => {
    socket.send( data );
  };

  const getViewportWidth = () => WIDTH;
  const getViewportHeight = () => HEIGHT;

  const addListeners = () => {
    collabCanvas.addEventListener( 'mousemove', ( e ) => {
      if ( mouseStatus.down ) {
        const normalizedX = e.clientX / WIDTH;
        const normalizedY = e.clientY / HEIGHT;
        sendData( JSON.stringify( {
          normalizedX, normalizedY, lineWidth: 10, strokeStyle: 'red',
        } ) );
      }
    } );


    collabCanvas.addEventListener( 'mousedown', ( ) => {
      mouseStatus.down = true;
    } );

    collabCanvas.addEventListener( 'mouseup', ( ) => {
      mouseStatus.down = false;
      sendData( JSON.stringify( { completed: true } ) );
    } );
  };

  return {
    setup,
    getViewportWidth,
    getViewportHeight,
    addListeners,
  };
}() );

app.setup();
app.addListeners();
