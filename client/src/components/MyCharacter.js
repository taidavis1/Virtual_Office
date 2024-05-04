import React, {useEffect, useContext , useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {ref , set as addFirebase, onValue , off} from "firebase/database";
import CanvasConext from './CanvasContext';
import {CHARACTER_IMAGE_SIZE, CHARACTER_CLASSES_MAP} from './characterConstants';
import {TILE_SIZE} from './mapConstants';
import {loadCharacter} from './slices/statusSlice';
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';
import {update as updateAllCharactersData} from './slices/allCharactersSlice'
import { firebaseDatabase } from '../firebase/firebase';

function MyCharacter({ myCharactersData, loadCharacter, updateAllCharactersData, webrtcSocket , name , setName}) {
    const context = useContext(CanvasConext);
    const dp = useDispatch();

    // const sendName = (Name) => {
    //     const myInitData = {
    //         ...MY_CHARACTER_INIT_CONFIG,
    //         name: Name,
    //         socketId: webrtcSocket.id,
    //     };

    //     addFirebase(ref(firebaseDatabase , `users/${MY_CHARACTER_INIT_CONFIG.id}`) , myInitData)  // Add data to firebase

    //     setIsOpen(!isOpen);
    //     setName("");
    // }


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
            name: name,
            socketId: webrtcSocket.id,
        };

        addFirebase(ref(firebaseDatabase , `users/${MY_CHARACTER_INIT_CONFIG.id}`) , myInitData)  // Add data to firebase
        setName("");
        // setIsOpen(prevstate => !prevstate);
        // setName("");
        // const users = {};
        // const myId = MY_CHARACTER_INIT_CONFIG.id;
        // users[myId] = myInitData;
        // updateAllCharactersData(users);
        
    }, [webrtcSocket]);

    useEffect(() => {
        
        onValue(ref(firebaseDatabase , 'users') , (data) => {
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
            context.canvas.font = "20px Arial"; 
            context.canvas.fillStyle = "white";
            context.canvas.textAlign = "center";
            context.canvas.fillText(
                character.name,
                character.position.x * TILE_SIZE + CHARACTER_IMAGE_SIZE / 2,
                character.position.y * TILE_SIZE - 10
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