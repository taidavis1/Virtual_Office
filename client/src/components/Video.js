import React , {useRef , useEffect} from "react";
import Peer from "simple-peer";

export default function Video(){

    const camRef = useRef(null);

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({video: {width: 200}}).then(view => {
            let cam = camRef.current;
            cam.srcObject = view;
            cam.onloadedmetadata = () => {
                cam.play().catch(err => {
                    console.error("Error:", err);
                });
            };
        })
        .catch(err => {
            console.error("error:", err);
        })
    } , [camRef]);

    return (
        <div className="videoDiv">
            <video ref={camRef} />
        </div>
    )
};