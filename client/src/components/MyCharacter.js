import React, {useEffect, useContext , useRef} from 'react';
import {connect, useDispatch} from 'react-redux';
import {ref , set as addFirebase, onValue , off} from "firebase/database";
import CanvasConext from './CanvasContext';
import {CHARACTER_IMAGE_SIZE, CHARACTER_CLASSES_MAP} from './characterConstants';
import {TILE_SIZE} from './mapConstants';
import {loadCharacter} from './slices/statusSlice';
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';
import {update as updateAllCharactersData} from './slices/allCharactersSlice'
import { firebaseDatabase } from '../firebase/firebase';
import Peer from "simple-peer";


function MyCharacter({ myCharactersData, loadCharacter, updateAllCharactersData, webrtcSocket }) {
    const context = useContext(CanvasConext);
    const dp = useDispatch();
    const CamRef = useRef(null);
    const client2Video = useRef(null);
    const peerRef = useRef(null);
  
    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ video: { width: 200 } }).then(view => {

          if (CamRef.current){
            CamRef.current.srcObject = view;
          }

          peerRef.current = new Peer({
            initiator: true,
            trickle: false,
            stream: view,
          });
      
          peerRef.current.on('signal', signal => {
            
            const usersRef = ref(firebaseDatabase, 'users');

            onValue(usersRef, data => {
              const users = data.val();
              const client2 = Object.values(users).find(u => u.socketId !== webrtcSocket.id);
      
              if (client2) {
                webrtcSocket.emit('sendCall', { to: client2.socketId, from: webrtcSocket.id, signal });
              }
            }, { onlyOnce: true });
          });
        });
      

        webrtcSocket.on('receiveAnswer', ({signal}) => {
          if (peerRef.current) {
            peerRef.current.signal(signal);
          }
        });

        webrtcSocket.on('receiveCall', ({ from, signal }) => {

          if (peerRef.current) {
            peerRef.current.destroy();
          }
      
          peerRef.current = new Peer({
            initiator: false,
            trickle: false,
            stream: CamRef.current?.srcObject,
          });
      
          peerRef.current.signal(signal);
      
          peerRef.current.on('signal', signal => {
            webrtcSocket.emit('sendAnswer', { to: from, signal: signal });
          });
      
          peerRef.current.on('stream', remoteStream => {
            if (client2Video.current) {
              client2Video.current.srcObject = remoteStream;
            }
          });
        });

      }, [webrtcSocket, CamRef, client2Video]);


    useEffect(() => {
        onValue(ref(firebaseDatabase , 'users') , (data) => {
            // console.log(data.val());
            dp(updateAllCharactersData(data.val()));              // Render all character from database
        });
        return () => off(ref(firebaseDatabase , 'users'));
    } , [dp]);

    useEffect(() => {
        const myInitData = {
            ...MY_CHARACTER_INIT_CONFIG,
            socketId: webrtcSocket.id,
        };

        addFirebase(ref(firebaseDatabase, `users/${MY_CHARACTER_INIT_CONFIG.id}`), myInitData); // Add data to firebase
    },[]);

    useEffect(() => {
        if (context == null || myCharactersData == null) {
            return;
        }

        Object.values(myCharactersData).forEach(character => {
            const characterImg = document.querySelector(`#character-sprite-img-${character.characterClass}`);
            const { sx, sy } = CHARACTER_CLASSES_MAP[character.characterClass].icon;
            context.canvas.drawImage(
                characterImg,
                sx,
                sy,
                CHARACTER_IMAGE_SIZE - 5,
                CHARACTER_IMAGE_SIZE - 5,
                character.position.x * TILE_SIZE,
                character.position.y * TILE_SIZE,
                CHARACTER_IMAGE_SIZE,
                CHARACTER_IMAGE_SIZE
            );
        });
        loadCharacter(true);
    }, [context, myCharactersData, loadCharacter]);

    return (
        <div className='videoDiv'>
            <video ref={CamRef} autoPlay muted />
            <video ref={client2Video} autoPlay muted />
        </div>
    ); ;
}

const mapStateToProps = (state) => {
    return {myCharactersData: state.allCharacters.users};
};

const mapDispatch = {loadCharacter, updateAllCharactersData};

export default connect(mapStateToProps, mapDispatch)(MyCharacter);