import '../App.css';
import React, {useState} from 'react';
import Requests from '../utils/requests';
import API from '../api_info';
import * as Utils from '../utils/utils';
import { ButtonForm } from '../forms/ButtonForm';
import { DocumentForm } from '../forms/DocumentForm';
import { ElementMetaForm } from '../forms/ElementMetaForm';
import { NavBar } from '../utils/Navbar';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export const DocumentApp = function(props){
    const [CurrentWindow, SetCurrentWindow] = useState("form");
    const document  = props.document;
    const reloadPage = props.reloadPage
    const doc_actions = props.doc_actions ? props.doc_actions : []
    const location = (props.location ?? "") + "/documents/" + document.id  
    
    const actions = [
        ...doc_actions,
        {
            name: "Удалить",
            action: ()=>{}
        }
    ]

    const Windows  = {
        "form": {
            name: "Форма",
            Code: ()=>{ 
                const [newDocument, setNewDocument] = useState({...document});
                const [selectedFile, setSelectedFile] = useState(null);
                return (
                    <Form>
                        <DocumentForm document={newDocument} setDocument={setNewDocument} setSelectedFile={setSelectedFile}/>
                        <Button onClick={()=>Requests.send_document(newDocument, selectedFile).then(reloadPage)}> Сохранить </Button>
                    </Form>
                )}
        },
        "metadata": {
            name: "Метадата",
            Code: ()=> (<ElementMetaForm element={document} />)
        }
    }

    let Container = Windows[CurrentWindow];

    //
    return (
        <>
        <NavBar name="Документ" windows={Windows} actions={actions} location={location}/>
        
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{Container.name}</h5>
                <Routes>
                    <Route path="" element={<Windows.form.Code/>}/>
                    <Route path="form" element={<Windows.form.Code/>}/>
                    <Route path="metadata" element={<Windows.metadata.Code/>}/>
                </Routes>
            </div>
        </div>

        
        </>
    )
}