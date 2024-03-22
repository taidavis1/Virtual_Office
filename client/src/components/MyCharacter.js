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
    const camRef = useRef(null);
    const peerRef = useRef(null);
    useEffect(() => {

        // Object.values(MY_CHARACTER_INIT_CONFIG).forEach(character => {
        //     console.log(character);
        //     const myInitData = {
        //         ...character,
        //         socketId: webrtcSocket.id,
        //     };
        //     addFirebase(ref(firebaseDatabase , `users/${character.id}`) , myInitData)  // Add data to firebase
        // });

        const myInitData = {
            ...MY_CHARACTER_INIT_CONFIG,
            socketId: webrtcSocket.id,
        };

        addFirebase(ref(firebaseDatabase , `users/${MY_CHARACTER_INIT_CONFIG.id}`) , myInitData)  // Add data to firebase

        // const users = {};
        // const myId = MY_CHARACTER_INIT_CONFIG.id;
        // users[myId] = myInitData;
        // updateAllCharactersData(users);


        navigator.mediaDevices.getUserMedia({video: {width: 200}}).then(view => {
            if (camRef.current) {
                camRef.current.srcObject = view;
            }
            peerRef.current = new Peer(
                {
                    initiator: true,
                    trickle: false,
                    stream: view,
                }
            );
            
            peerRef.current.on('signal' , (signal) => {
                webrtcSocket.emit('sendCall' , {to: 'Client-2' , from: webrtcSocket.id , signal})      // Harded coded for CLient-2 having 
                                                                                                     // read the socket id from firebase yet
            });
            
            // webrtcSocket.on('sendCall', ({ from, signal }) => {

            //     console.log('Received offer signal:', signal);

            //     // if (!peerRef.current) {

            //     //     peerRef.current = new Peer({
            //     //         initiator: false,
            //     //         trickle: false,
            //     //         stream: view,
            //     //     });

            //     //     peerRef.current.signal(signal);
            //     // };
            // });
            
        });

        webrtcSocket.on('sendCall', ({ from, signal }) => {

            console.log('Received offer signal:', signal);
            peerRef.current.signal(signal);
        });
        
    }, [webrtcSocket]);

    useEffect(() => {
        const changingPos =  onValue(ref(firebaseDatabase , 'users') , (data) => {
            // console.log(data.val());
            dp(updateAllCharactersData(data.val()));              // Render all character from database
        });
        return () => off(ref(firebaseDatabase , 'users'));
    } , [dp]);

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

    return null;
}

const mapStateToProps = (state) => {
    return {myCharactersData: state.allCharacters.users};
};

const mapDispatch = {loadCharacter, updateAllCharactersData};

export default connect(mapStateToProps, mapDispatch)(MyCharacter);