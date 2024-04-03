import React , {useRef , useEffect, useState} from "react";
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';
import { firebaseDatabase } from '../firebase/firebase';
import Peer from "simple-peer";
import Initialized from "./initializedVideo";
import ReceiveVideo from "./ReceiveVideo";

export default function Video({webrtcSocket}){

    const CamRef = useRef(null);

    // const [filterData , setfilterData] = useState([]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { width: 200 } }).then(view => {
            if (CamRef.current){
                CamRef.current.srcObject = view;
            }
        })
    });

    const filterdata = Object.keys(myCharacterData)
        .filter((oid) => oid > myCharacterData?.id)
        .reduce((filterobj , key) => {
            filterobj[key] = myCharacterData[key];
            return filterobj;
        } , {});

    return <>(
        myCharacterData && <div className='videoDiv'>
            <video ref={CamRef} autoPlay muted />
            {
                Object.keys(filterdata).map((otherid) => {
                    return <Initialized
                        key={filterdata[otherid].socketId}
                        socketFrom={myCharacterData.socketId}
                        selfstream={CamRef}
                        socketto={filterdata[otherid].socketId}
                        webrtcSocket={webrtcSocket}
                        />
                })
            }

           <ReceiveVideo 
                socketFrom={myCharacterData.socketId}
                selfstream={CamRef}
                webrtcSocket={webrtcSocket}
            />
        </div>
    )</>

}