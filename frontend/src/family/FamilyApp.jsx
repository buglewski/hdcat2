import React, {useContext} from "react";
import Requests from "../utils/requests";

import { Col, Row  } from "react-bootstrap";

import { Context } from "../App";
import { getPersonByIdInFP, getClaimById } from "../utils/utils";

import { Navigate, useNavigate, useParams, Route, Routes } from "react-router-dom";

import { PersonSideBar } from "../person/PersonSideBar";
import { PersonBody } from "../person/PersonBody";
import { ElementMetaForm } from "../forms/ElementMetaForm";
import { NavBar } from "../utils/Navbar";

import { ClaimBody } from "../claim/ClaimBody";
import { ClaimSideBar } from "../claim/ClaimSideBar";

export const FamilyApp = function(props){
    const family = props.family
    const reloadPage = props.reloadPage
    const context = useContext(Context);
    const [SetCurrentModalComponent, SetShowModal] = [context.SetCurrentModalComponent, context.SetShowModal];
    const location = (props.location ?? "") + "/families/" + family.id;
    const navigate = useNavigate()

    

    const actions = [
        {
            name: "Добавить новую персону",
            action: ()=>{
                SetCurrentModalComponent({
                    name: "CreatePersonModal", 
                    callback: async (person_id, role)=>{
                        if (family.id === 0){
                            let response = await Requests.create_family()
                            family.id = response.content.id
                        } 
                        await Requests.send_family_person({family_id: family.id, person_id: person_id, role: role})
                        navigate((props.location ?? "") + "/families/" + family.id + "/persons/" + person_id)
                        reloadPage()
                    },
                    withrole: true
                });
                SetShowModal(1);
            }
        },
        {
            name: "Добавить новое заявление",
            action: ()=>{
                SetCurrentModalComponent({
                    name: "CreateClaimModal", 
                    callback: ()=>reloadPage(),
                    family: family
                });
                SetShowModal(1);
            },
        },
        {
            name: "Редактировать роли",
            action: ()=>{
                SetCurrentModalComponent({
                    name: "SetRolesModal", 
                    callback: ()=>reloadPage(),
                    family_persons: family.family_persons
                });
                SetShowModal(1);
            }
        },
        {
            name: "Удалить семью",
            action: ()=>{
                SetCurrentModalComponent({
                    name: "AreYouSureModal", 
                    callback: async ()=>{
                        await Requests.delete_object("delete/family/" + family.id)
                        navigate("/")
                    },
                    message: "Вы уверены, что хотите удалить эту семью? Настоящее действие нельзя будет отменить"
                });
                SetShowModal(1);
            }
        }
    ]

    const Windows  = {
        "persons": {
            name: "Персоны",
            Code: ()=>{ 
                const params = useParams()
                return (
                    <Row>
                        <Col md="3">
                            {family.family_persons?.map((family_person, index)=>(
                                <PersonSideBar person={family_person.person} 
                                    role={family_person.role}
                                    location={location + "/persons/" + family_person.person.id}
                                />
                            ))}
                        </Col>
                        {
                            params.person_id &&
                            <Col md="9">
                                <PersonBody
                                    person = {getPersonByIdInFP(family.family_persons, params.person_id)}
                                    reloadPage = {reloadPage}
                                    location={location + "/persons/" + params.person_id}
                                />
                            </Col>
                        }
                    </Row>
                )
            },
        },
        "claims": {
            name : "Заявления",
            Code : ()=>{ 
                const params = useParams()
                return (
                    <div class="row">
                        <div class="col-3">
                            {family.claims?.map((claim, index)=>(
                                <ClaimSideBar claim={claim} location={location + "/claims/" + claim.id} />
                            ))}
                        </div>
                        {
                            params.claim_id &&
                            <div class="col-9">
                                <ClaimBody 
                                    claim = {getClaimById(family.claims, params.claim_id)}
                                    family = {family}
                                    reloadPage = {reloadPage}
                                    location={location + "/claims/" + params.claim_id}
                                />
                            </div>
                        }
                    </div>
                )
            },
        },
        "metadata": {
            name: "Метадата",
            Code: ()=> (<ElementMetaForm element={family} />)
        }
    }    

    return (
        <>
        <NavBar windows={Windows} actions={actions} location={location}/>
        <div className="card">
            <div className="card-body">
                <Routes>
                    <Route path="/" element={<Navigate replace to="persons" />}/>
                    <Route path="/persons/" element={<Windows.persons.Code/>}/>
                    <Route path="/persons/:person_id/*" element={<Windows.persons.Code/>}/>
                    <Route path="/claims/" element={<Windows.claims.Code/>}/>
                    <Route path="/claims/:claim_id/*" element={<Windows.claims.Code/>}/>
                    <Route path="/metadata" element={<Windows.metadata.Code/>}/>
                </Routes>
            </div>
        </div>
        </>
    )
}