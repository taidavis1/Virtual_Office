import React, { useState } from 'react';

import GameLoop from './components/GameLoop';
import Office from './components/Office';

import Video from './components/Video';

import './App.css';
import { io } from 'socket.io-client';
import Popup from './components/Popup';

const WEBRTC_SOCKET = io('http://localhost:8080');

function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [name , setName] = useState("");
  const [isOpen , setIsOpen] = useState(true);

  WEBRTC_SOCKET.on('connect', () => {
    setSocketConnected(true);
  });
  return (
    <>
        <header>        
        </header>
        <Popup name = {name} setName = {setName} isOpen = {isOpen} setIsOpen = {setIsOpen} />
        {socketConnected && !isOpen &&
          <main class="content">
            <GameLoop webrtcSocket={WEBRTC_SOCKET}>
              <Office name = {name} setName = {setName} webrtcSocket={WEBRTC_SOCKET}/>
            </GameLoop>
            <Video webrtcSocket={WEBRTC_SOCKET} />
          </main>
        }
        <footer>
        </footer>
    </>
  );
}

export default App;