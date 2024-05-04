import React , {useState} from 'react';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

function Popup (props) {

    const btn_click = (Name) => {
        props.setName(Name);
        props.setIsOpen(!props.isOpen);
    }

    return (
		<div className={`${props.isOpen ? "popup" : "hidden"}`}>
            <div className="popup_outer">
                <form className="popupform">
                    <label for="name">Name</label>
                    <input value={props.name} onChange={(e) => props.setName(e.target.value)} name="name" />
                    <button onClick={() => btn_click(props.name)} type="button" className="submitBtn">Submit</button>
                </form>
            </div>
        </div>
    )
};

export default Popup;