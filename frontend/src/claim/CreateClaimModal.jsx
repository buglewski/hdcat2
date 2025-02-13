import React, { useContext } from "react";
import Requests from "../utils/requests";
import { ClaimForm } from "../forms/ClaimForm";

import { Button, Form, Modal } from "react-bootstrap";

import { isClaimEmpty } from "../utils/utils";

export const CreateClaimModal = ({setShow, callback, family}) => {
    
    const [newClaim, setNewClaim] = React.useState({});
    const handleSave = async ()=>{
        setShow(0);
        const response = await Requests.send_claim(newClaim)
        callback();
    }

    return (<>
            <Modal.Header closeButton>
            <Modal.Title>{"Создать заявление"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form autoComplete="off">
                <ClaimForm 
                    claim={newClaim} 
                    setClaim={setNewClaim} 
                    family={family}
                />
                </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShow(0)}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isClaimEmpty(newClaim)}>
                Save Changes
            </Button>
            </Modal.Footer>
        </>) 
    
}