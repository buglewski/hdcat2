import React, { useContext } from "react";
import Requests from "../utils/requests";

import { Button, Form, Modal } from "react-bootstrap";

import { PersonFullName } from "../utils/utils";

export const SetRolesModal = ({setShow, callback, family_persons}) => {
    
    const [newFamilyPersons, setNewFamilyPersons] = React.useState(family_persons);
    const handleRole = (index, nrole)=>{
        const nextCounters = newFamilyPersons.map((fp, i) => {
            if (i === index) {
                return {...fp, role : nrole};
            } else {
                return fp;
            }
        });
        setNewFamilyPersons(nextCounters);
    }
    const handleSave = async ()=>{
        setShow(0);
        const promises = newFamilyPersons.map((fp)=>Requests.send_family_person({id : fp.id, role: fp.role}))
        await Promise.all(promises)
        callback();
    }

    return (<>
            <Modal.Header closeButton>
            <Modal.Title>{"Установить роли"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form autoComplete="off">
                {newFamilyPersons.map((family_person, index)=>(
                    <div class="mb-3 row">
                    <label for={"id"+index} class="col-sm-8 col-form-label">{PersonFullName(family_person.person)} </label>
                    <div class="col-sm-4">
                    <input type="text" class="form-control" id={"id"+index} value={family_person.role} 
                        onChange={
                            (event)=>{handleRole(index, event.target.value)}
                        }/>
                    </div>
                    </div>
                ))}
                </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShow(0)}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSave}>
                Save Changes
            </Button>
            </Modal.Footer>
        </>) 
    
}