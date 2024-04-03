import React , {useRef , useEffect, useState} from "react";
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';
import { useSelector } from "react-redux";
import Peer from "simple-peer";
import Initialized from "./initializedVideo";
import ReceiveVideo from "./ReceiveVideo";

export default function Video({webrtcSocket}){

    const CamRef = useRef(null);
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { width: 200 } }).then(view => {
            if (CamRef.current){
                CamRef.current.srcObject = view;
            }
        })
    });

    const myCharacterData = useSelector(state => state.allCharacters.users);

    const filterdata = myCharacterData ? Object.keys(myCharacterData)
        .filter(oid => oid < MY_CHARACTER_INIT_CONFIG.id)
        .map(oid => myCharacterData[oid]) : [];

    return (
        <>
            {myCharacterData && (
                <div className='videoDiv'>
                    <video ref={CamRef} autoPlay muted />

                    {filterdata.map(otherId => (
                        <Initialized
                            key={filterdata[otherId].socketId}
                            socketFrom={myCharacterData[MY_CHARACTER_INIT_CONFIG.id].socketId}
                            selfStream={CamRef}
                            socketTo={filterdata[otherId].socketId}
                            webrtcSocket={webrtcSocket}
                        />
                    ))}
                    
                    <ReceiveVideo 
                        socketFrom={myCharacterData[MY_CHARACTER_INIT_CONFIG.id].socketId}
                        selfStream={CamRef}
                        webrtcSocket={webrtcSocket}
                    />
                </div>
            )}
        </>
    );
}