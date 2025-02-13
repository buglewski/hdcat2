import React, { useContext } from "react";
import Requests from "../utils/requests";
import { Context } from "../App";
import { useNavigate } from 'react-router-dom';
import { DocumentForm } from "../forms/DocumentForm";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { isEmpty } from "../utils/utils";


export const CreateDocumentModal = ({setShow, callback}) => {
    
    const [newDocument, setNewDocument] = React.useState({});
    const [newSelectedFile, setNewSelectedFile] = React.useState(null);
    const handleSave = async ()=>{
        setShow(0);
        const response = await Requests.send_document(newDocument, newSelectedFile)
        callback(response.content.id);
    }

    return (<>
            <Modal.Header closeButton>
            <Modal.Title>{"Создать документ"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <DocumentForm 
                    document={newDocument} 
                    setDocument={setNewDocument} 
                    setSelectedFile = {setNewSelectedFile} 
                    withSearch = {true}
                />
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShow(0)}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isEmpty(newDocument)}>
                Save Changes
            </Button>
            </Modal.Footer>
        </>) 
    
}