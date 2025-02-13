import React, { useContext } from "react";
import Requests from "../utils/requests";
import { HouseForm } from "../forms/HouseForm";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Form } from "react-bootstrap";

import { isEmpty } from "../utils/utils";

export const CreateHouseModal = ({setShow, callback}) => {
    
    const [newHouse, setNewHouse] = React.useState({});
    const handleSave = async ()=>{
        setShow(0);
        const response = await Requests.send_house(newHouse)
        callback(response.content.id);
    }

    return (<>
            <Modal.Header closeButton>
            <Modal.Title>{"Создать ж/п"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form autoComplete="off">
                <HouseForm 
                    house={newHouse} 
                    setHouse={setNewHouse} 
                    witharea={true}
                    withSearch={true}
                />
                </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShow(0)}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isEmpty(newHouse)}>
                Save Changes
            </Button>
            </Modal.Footer>
        </>) 
    
}