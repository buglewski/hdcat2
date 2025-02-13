import React, { useContext } from "react";
import Requests from "./requests";

import { Button, Form, Modal } from "react-bootstrap";

export const AreYouSureModal = ({setShow, callback, message}) => {
    
    const handleSave = async ()=>{
        setShow(0);
        callback();
    }

    return (<>
            <Modal.Header closeButton>
            <Modal.Title>{"Вы уверены?"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShow(0)}>
                Нет
            </Button>
            <Button variant="primary" onClick={handleSave}>
                Да
            </Button>
            </Modal.Footer>
        </>) 
    
}