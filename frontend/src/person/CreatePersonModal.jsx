import React, { useContext } from "react";
import Requests from "../utils/requests";
import { HouseForm } from "../forms/HouseForm";
import { PersonForm } from "../forms/PersonForm";
import { DocumentForm } from "../forms/DocumentForm";

import { Button, FloatingLabel, Form, Modal} from "react-bootstrap";


import { isEmpty } from "../utils/utils";

export const CreatePersonModal = ({setShow, callback, withrole}) => {
    
    const [newPerson, setNewPerson] = React.useState({});
    const [role, setRole] = React.useState("");
    const [newDocument, setNewDocument] = React.useState({});
    const [newSelectedFile, setNewSelectedFile] = React.useState(null);
    const [newHouseReg, setNewHouseReg] = React.useState({});
    const [newHouseFact, setNewHouseFact] = React.useState({});
    //const [withoutDock, setWithoutDock] = React.useState(false);
    //const [withoutHouse, setWithoutHouse] = React.useState(false);
    const [FactRegEq, setFactRegEq] = React.useState(false);

    const setNewPersonHandler = (person)=>{
        setNewPerson(person)
        if (person.passport){
            setNewDocument(person.passport)
        }
        if (person.housereg){
            setNewHouseReg(person.housereg)
        }
        if (person.housefact){
            if (person.regaddr_id != person.factaddr_id){
                setNewHouseFact(person.housefact)
            } else {
                setFactRegEq(true);
            }
        }
        
    }

    const handleSave = ()=>{
        setShow(0);
        const promises = [0, 0, 0]
        const withoutDock = isEmpty(newDocument)
        const withoutHouseReg = isEmpty(newHouseReg)
        const withoutHouseFact = isEmpty(newHouseFact)

        if (!withoutDock) promises[0] = (Requests.send_document(newDocument, newSelectedFile))
        if (!withoutHouseReg) promises[1] = (Requests.send_house(newHouseReg))
        if (!withoutHouseFact && !FactRegEq) promises[2] = (Requests.send_house(newHouseFact))

        Promise.all(promises)
        .then((results)=>{
            if (!withoutDock) newPerson.passport_id = results[0].content.id;
            if (!withoutHouseReg) {
                newPerson.regaddr_id = results[1].content.id;
                if (FactRegEq){
                    newPerson.factaddr_id = results[1].content.id;
                } 
            }
            if (!withoutHouseFact && !FactRegEq) {
                newPerson.factaddr_id = results[2].content.id;
            }
            return Requests.send_person(newPerson)
        }).then((resp)=>{
            const promises = [0, 0, 0, resp]
            if (newPerson.passport_id) promises[0] = (Requests.send_person_document({person_id : resp.content.id, document_id: newPerson.passport_id}))
            if (newPerson.regaddr_id) promises[1] = (Requests.send_person_house({person_id : resp.content.id, house_id: newPerson.regaddr_id}))
            if (newPerson.factaddr_id) promises[2] = (Requests.send_person_house({person_id : resp.content.id, house_id: newPerson.factaddr_id}))
            return Promise.all(promises)
        }).then((results)=>{
            callback(results[3].content.id, role);
        })
    }

    return (<>
            <Modal.Header closeButton>
            <Modal.Title>{"Создать ж/п"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form autoComplete="off">
            {
                withrole &&
                <>
                <FloatingLabel controlId="role" label="Роль">
                <Form.Control type="text" value={role ?? ""}  
                    onChange={(event)=>setRole(event.target.value)} />
                </FloatingLabel>
                </>
            }
            <h5 className="card-title">Персональные данные:</h5>
            <PersonForm person={newPerson} setPerson={setNewPersonHandler} withSearch={true}/>
            {
                <>
                <h5 className="card-title">Документ удостоверяющий личность:</h5>
                <DocumentForm document={newDocument} setDocument={setNewDocument} setSelectedFile = {setNewSelectedFile} withSearch={true}/>
                </>
            }
            {   
                <>
                <h5 className="card-title">Адрес регистрации:</h5>
                <HouseForm house={newHouseReg} setHouse={setNewHouseReg} withSearch={true}/>
                <h5 className="card-title">Адрес фактического проживания:</h5>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={FactRegEq} onChange={(event)=>{setFactRegEq(event.target.checked)}} id="eq" />
                    <label className="form-check-label" htmlFor="eq">
                        Совпадает с адресом регистрации
                    </label>
                </div>
                {!FactRegEq && <HouseForm house={newHouseFact} setHouse={setNewHouseFact} withSearch={true}/>}
                </>
            }
            </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShow(0)}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isEmpty(newPerson)}>
                Save Changes
            </Button>
            </Modal.Footer>
        </>) 
    
}