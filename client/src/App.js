import React, { useState } from 'react';

import GameLoop from './components/GameLoop';
import Office from './components/Office';

import './App.css';
import { io } from 'socket.io-client';
import Video from './components/Video';

const WEBRTC_SOCKET = io('http://localhost:8080');

function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  WEBRTC_SOCKET.on('connect', () => {
    setSocketConnected(true);
  });
  return (
    <>
        <header>        
        </header>
        {socketConnected &&
          <main class="content">
              <GameLoop>
                <Office webrtcSocket={WEBRTC_SOCKET}/>
              </GameLoop>
              <Video />
          </main>
        }
        <footer>
        </footer>
    </>
  );
}

export default App;