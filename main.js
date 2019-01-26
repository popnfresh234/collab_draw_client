const app = ( function () {
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const canvas = document.getElementById( 'collab_canvas' );
  const ctx = canvas.getContext( '2d' );
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

  const setup = () => {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.border = '1px solid black';
    socket = new WebSocket( 'ws://localhost:8080/' );
    socket.onmessage = ( msg ) => {
      drawLine( JSON.parse( msg.data ), ctx );
    };
  };

  const sendData = ( data ) => {
    socket.send( data );
  };

  const getViewportWidth = () => WIDTH;
  const getViewportHeight = () => HEIGHT;

  const addListeners = () => {
    canvas.addEventListener( 'mousemove', ( e ) => {
      if ( mouseStatus.down ) {
        const normalizedX = e.clientX / WIDTH;
        const normalizedY = e.clientY / HEIGHT;
        points.push( { normalizedX, normalizedY } );
        sendData( JSON.stringify( points ) );
      }
    } );


    canvas.addEventListener( 'mousedown', ( ) => {
      mouseStatus.down = true;
    } );

    canvas.addEventListener( 'mouseup', ( ) => {
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
