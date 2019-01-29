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

  const drawLine = ( pointsArray, context ) => {
    // for ( let i = 0; i < pointsArray.length - 1; i += 1 ) {
    //   context.moveTo(
    //     pointsArray[i].normalizedX * WIDTH,
    //     pointsArray[i].normalizedY * HEIGHT,
    //   );
    //   context.lineTo(
    //     pointsArray[i + 1].normalizedX * WIDTH,
    //     pointsArray[i + 1].normalizedY * HEIGHT,
    //   );
    // }
    // context.stroke();

    context.moveTo( pointsArray[0].normalizedX * WIDTH, pointsArray[0].normalizedY * HEIGHT );
    for ( let i = 1; i < pointsArray.length - 2; i += 1 ) {
      const xc = ( ( pointsArray[i].normalizedX * WIDTH ) + ( pointsArray[i + 1].normalizedX * WIDTH ) ) / 2;
      const yc = ( ( pointsArray[i].normalizedY * HEIGHT ) + ( pointsArray[i + 1].normalizedY * HEIGHT ) ) / 2;
      context.quadraticCurveTo( pointsArray[i].normalizedX * WIDTH, pointsArray[i].normalizedY * HEIGHT, xc, yc );
    }
    context.lineWidth = 5;
    context.stroke();
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
        sendData( JSON.stringify( { normalizedX, normalizedY } ) );
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
