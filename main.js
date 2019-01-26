const app = ( function () {
  const WS_ADDRESS = 'ws://localhost:8080/';
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const GRID_COLOR = 'rgb(206, 206, 206)';
  const collabCanvas = document.getElementById( 'collab_canvas' );
  const bgCanvas = document.getElementById( 'bg_canvas' );
  const collabCtx = collabCanvas.getContext( '2d' );
  const bgCtx = bgCanvas.getContext( '2d' );
  let socket = null;
  const mouseStatus = {
    down: false,
  };
  let points = [];

  const drawLine = ( pointsArray, context ) => {
    if ( pointsArray.length > 1 ) {
      context.beginPath();
      context.moveTo(
        pointsArray[pointsArray.length - 2].normalizedX * WIDTH,
        pointsArray[pointsArray.length - 2].normalizedY * HEIGHT,
      );
      context.lineTo(
        pointsArray[pointsArray.length - 1].normalizedX * WIDTH,
        pointsArray[pointsArray.length - 1].normalizedY * HEIGHT,
      );
      context.stroke();
    }
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
    bgCanvas.width = WIDTH;
    bgCanvas.height = HEIGHT;
    drawGrid( bgCtx );
    socket = new WebSocket( WS_ADDRESS );
    socket.onmessage = ( msg ) => {
      drawLine( JSON.parse( msg.data ), collabCtx );
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
        points.push( { normalizedX, normalizedY } );
        sendData( JSON.stringify( points ) );
      }
    } );


    collabCanvas.addEventListener( 'mousedown', ( ) => {
      mouseStatus.down = true;
    } );

    collabCanvas.addEventListener( 'mouseup', ( ) => {
      mouseStatus.down = false;
      points = [];
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
