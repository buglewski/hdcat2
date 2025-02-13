import React from "react";
import Requests from "../utils/requests";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Context } from "../App";
import { NavBar } from "../utils/Navbar";
import { DocumentApp } from "../document/DocumentApp";
import { FamilyClaimTable } from "../tables/FamilyClaimTable";
import { PersonForm } from "../forms/PersonForm";
import { ButtonForm } from "../forms/ButtonForm";
import { ElementMetaForm } from "../forms/ElementMetaForm";
import { getDocumentById, PersonFullName } from "../utils/utils";
import { PersonHouseApp } from "./PersonHouseApp";

export const PersonBody = function(props){
    const person = props.person
    const reloadPage = props.reloadPage
    const context = React.useContext(Context);
    const [SetCurrentModalComponent, SetShowModal] = [context.SetCurrentModalComponent, context.SetShowModal];
    const location = props.location

    const handlePersonUpload = (person) => {
        Requests.send_person(person)
        .then(() => {
            reloadPage()
        })
    }

    

    const doc_actions = (document_id) => [
        {
            name: "Сделать док-м уд-м личность",
            action: ()=>{
                Requests.send_person({...person, passport_id : document_id})
                .then(() => {
                    reloadPage()
                })
            }
        }
    ]

    const actions = [
        {
            name: "Привязать новый документ",
            action: ()=>{
                SetCurrentModalComponent({name: "CreateDocumentModal", callback: async (document_id)=>{
                    const response = await Requests.send_person_document({person_id: person.id, document_id : document_id});
                    reloadPage();
                }});
                SetShowModal(1);
            }
        },
        {
            name: "Привязать новое ж/п",
            action: ()=>{
                SetCurrentModalComponent({name: "CreateHouseModal", callback: async (house_id)=>{
                    const response = await Requests.send_person_house({person_id: person.id, house_id : house_id});
                    reloadPage();
                }});
                SetShowModal(1);
            }
        },
        {
            name: "Удалить Персону",
            action: ()=>{
                SetCurrentModalComponent({
                    name: "AreYouSureModal", 
                    callback: async ()=>{
                        await Requests.delete_object("delete/person/" + person.id)
                        //navigate("/")
                    },
                    message: "Вы уверены, что хотите удалить эту семью? Настоящее действие нельзя будет отменить"
                });
                SetShowModal(1);
            }
        }
    ]


    const Windows  = {
        "form": {
            name: "Форма",
            Code: ()=>{ 
                const [newPerson, setNewPerson] = React.useState({...person});
                return (
                    <form>
                        <PersonForm person={newPerson} setPerson={setNewPerson}/>
                        <ButtonForm 
                            value={"Сохранить"}
                            onClick={()=>{
                                handlePersonUpload(newPerson);
                            }}
                        />
                    </form>
                )
            }
        },
        "document": {
            name: "Документ",
            hidden: true,
            Code: ()=>{
                const params = useParams();
                return (
                    <DocumentApp
                        document={getDocumentById(person.documents, params.document_id)} 
                        reloadPage={reloadPage}
                        doc_actions={doc_actions(params.document_id)}
                        location={location}
                    />
            )}
        },
        "person_houses": {
            name: "Жилые помещения",
            Code: () => {
                console.log(person.person_houses)
                return (
                    <div class="row">
                        {person.person_houses.map((person_house, index)=>(
                            <PersonHouseApp key={person_house.id} personHouse={person_house} reloadPage={reloadPage}/>
                        ))}
                    </div>
                )
            },
        },
        "families": {
            name: "Семьи",
            Code: ()=>{
                const families = new Array(person.family_persons.length)
                for (let i in person.family_persons){
                    families[i] = person.family_persons[i].family
                }
                return (
                    <FamilyClaimTable families={families}/>
                )
            },
        },
        "metadata": {
            name: "Метадата",
            Code: ()=> (<ElementMetaForm element={person} />)
        }
    }

    return (
        <>
        <NavBar name={PersonFullName(person)} windows={Windows} actions={actions} location={location}/>
        <div class="card">
            <div class="card-body">
                <Routes>
                    <Route path="/" element={<Navigate replace to="form" />}/>
                    <Route path="/form" element={<Windows.form.Code/>}/>
                    <Route path="/person_houses" element={<Windows.person_houses.Code/>}/>
                    <Route path="/families" element={<Windows.families.Code/>}/>
                    <Route path="/documents/:document_id/*" element={<Windows.document.Code/>}/>
                    <Route path="/metadata" element={<Windows.metadata.Code/>}/>
                </Routes>
            </div>
        </div>
        </>
    )
}