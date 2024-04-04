import React, { useEffect, useRef } from "react";
import Peer from "simple-peer";

export default function ReceiveVideo({socketFrom , selfstream , webrtcSocket , socketto , callsignal}){

    const peerRef = useRef();
    const otherVideo = useRef(null);


    useEffect(() => { 

        peerRef.current = new Peer({
            initiator: false,
            trickle: false,
            stream: selfstream.current.srcObject,
        });

        peerRef.current.on('signal', signal => {
            webrtcSocket.emit('sendAnswer', { to: socketFrom, from: socketto, signal: signal });
        });

        peerRef.current.signal(callsignal);
      
        peerRef.current.on('stream', remoteStream => {
            if (otherVideo.current) {
              otherVideo.current.srcObject = remoteStream;
            }
        });

    } , [socketFrom , selfstream , webrtcSocket , socketto]);

    return <>
        {otherVideo && <video ref={otherVideo} autoPlay = {true} playsInline = {true} />}
    </>
}