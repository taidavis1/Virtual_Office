import React, { useEffect, useRef } from "react";
import Peer from "simple-peer";

export default function Initialized({socketFrom , selfstream , socketto , webrtcSocket}){

    const peerRef = useRef();
    const otherVideo = useRef(null);

    console.log(socketto);

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ video: { width: 200 } }).then(view => {
            if (otherVideo.current){
                otherVideo.current.srcObject = view;
            }
        })
    } , []);

    useEffect (() => {

        peerRef.current = new Peer({
            initiator: true,
            trickle: false,
            stream: selfstream.current.srcObject,
        });

        peerRef.current.on('signal', signal => {
            webrtcSocket.emit('sendCall', { to: socketto, from: socketFrom, signal });
        });

        webrtcSocket.on('receiveAnswer', ({signal}) => {
            if (peerRef.current) {
              peerRef.current.signal(signal);
            }
        });

        peerRef.current.on('stream', remoteStream => {
            if (otherVideo.current) {
              otherVideo.current.srcObject = remoteStream;
            }
        });

    } , [webrtcSocket , selfstream , socketto , socketFrom]);

    return (
        <>
            {otherVideo && <video ref={otherVideo} autoPlay = {true} playsInline = {true} />}
        </>
    );
};