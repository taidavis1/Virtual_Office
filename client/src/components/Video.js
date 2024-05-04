import React , {useRef , useEffect, useState} from "react";
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';
import {connect} from 'react-redux';
import Initialized from "./initializedVideo";
import ReceiveVideo from "./ReceiveVideo";

function Video({allCharactersData , webrtcSocket}){

    const CamRef = useRef(null);

    const [callReceived , setcallReceived] = useState({});

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ video: { width: 200 } }).then(view => {
            if (CamRef.current){
                CamRef.current.srcObject = view;
            }
        })
    } , []);


    useEffect(() => {

        const receiveCall = ({ from, signal }) => {
            setcallReceived(prevCall => ({
                ...prevCall,
                [from]: signal
            }));
        };

        webrtcSocket.on('receiveCall', receiveCall);

        return () => {
            webrtcSocket.off('receiveCall', receiveCall);
        };

    }, [webrtcSocket]);

    const myCharacterData = allCharactersData[MY_CHARACTER_INIT_CONFIG.id];

    const otherCharacters = Object.values(allCharactersData).filter(character => character.id !== myCharacterData.id);
    
    const filterData = Object.values(otherCharacters).filter(character => character.id <= myCharacterData.id);


    return <>
        {
            
            myCharacterData &&
                <div className='videoDiv'>
                    <video ref={CamRef} autoPlay = {true} playsInline = {true} />
                    {filterData.map(oid => {
                        return <Initialized
                            key={oid.id}
                            socketFrom={myCharacterData.socketId}
                            selfstream={CamRef}
                            socketto={oid.socketId}
                            webrtcSocket={webrtcSocket}
                        />

                    })}
                    
                    {Object.keys(callReceived).map((osd) => {
                        return <ReceiveVideo 
                            key={osd}
                            socketto={myCharacterData.socketId}
                            socketFrom={osd}
                            selfstream={CamRef}
                            callsignal = {callReceived[osd]}
                            webrtcSocket={webrtcSocket}
                        />

                    })}

                </div>
        }</>;
}

const mapStateToProps = (state) => {
    return {allCharactersData: state.allCharacters.users};
};

export default connect(mapStateToProps, {})(Video);