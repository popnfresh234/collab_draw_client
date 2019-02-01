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

  const COLORS = {
    black: 'rgb(0, 0, 0)',
    white: 'rgb(255, 255, 255)',
    red: 'rgb(255, 0, 0)',
    orange: 'rgb(255, 127, 0)',
    yellow: 'rgb(255, 255, 0)',
    green: 'rgb(0,255,0)',
    blue: 'rgb( 0,0,255)',
    indigo: 'rgb(75,0,130)',
    violet: 'rgb(139,0,255)',
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

  const setOptionTextColors = () => {
    const options = document.getElementsByTagName( 'option' );
    for ( let i = 0; i < options.length; i += 1 ) {
      const option = options[i];
      const color = COLORS[option.value];
      if ( color ) {
        option.style.color = color;
      }
    }
  };

  const setup = () => {
    setOptionTextColors();
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
        // Get the color from the color select element
        const colorSelect = document.getElementById( 'colors' );
        const strokeStyle = colorSelect.options[colorSelect.selectedIndex].value;
        // Get the line width from the line width select element
        const lineWidthSelect = document.getElementById( 'width_select' );
        const lineWidth = lineWidthSelect.options[lineWidthSelect.selectedIndex].value;
        sendData( JSON.stringify( {
          normalizedX, normalizedY, lineWidth, strokeStyle,
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
