import React, { useEffect, useRef } from "react";
import Peer from "simple-peer";

export default function ReceiveVideo({socketFrom , selfstream , webrtcSocket}){

    const peerRef = useRef();
    const otherVideo = useRef(null);

    useEffect(() => { 

        peerRef.current = new Peer({
            initiator: false,
            trickle: false,
            stream: selfstream,
        });

        peerRef.current.on('signal', signal => {
            webrtcSocket.emit('sendAnswer', { to: socketFrom, signal: signal });
        });

        webrtcSocket.on('receiveCall', ({ from, signal }) => {
            peerRef.current.signal(signal);
        });
      
        peerRef.current.on('stream', remoteStream => {
            if (otherVideo.current) {
              otherVideo.current.srcObject = remoteStream;
            }
        });

    } , [socketFrom , selfstream , webrtcSocket]);

    return <>
        {otherVideo && <video ref={otherVideo} autoPlay = {true} />}
    </>;
}