import React, {useState, useContext} from "react";
import Requests from "../utils/requests";
import { Navigate, useNavigate, useParams, Route, Routes } from "react-router-dom";

import { Button, Form } from "react-bootstrap";

import { PersonSideBar } from "../person/PersonSideBar";
import { PersonBody } from "../person/PersonBody";
import { ElementMetaForm } from "../forms/ElementMetaForm";
import { NavBar } from "../utils/Navbar";
import { ClaimForm } from "../forms/ClaimForm";
import { Context } from "../App";

export const ClaimBody = function(props){
    const claim = props.claim
    const family = props.family
    const reloadPage = props.reloadPage
    const location = props.location
    const navigate = useNavigate()
    const context = useContext(Context);
    const [SetCurrentModalComponent, SetShowModal] = [context.SetCurrentModalComponent, context.SetShowModal];

    console.log(claim)

    const handleClaimUpload = (claim) => {
        Requests.send_claim(claim)
        .then(() => {
            reloadPage()
        })
    }



    const actions = [
        {
            name: "Трансформировать в Word",
            action: ()=> document.location.replace('/getclaimfile/'+claim.id)
        },
        {
            name: "Удалить заявление",
            action: ()=>{
                SetCurrentModalComponent({
                    name: "AreYouSureModal", 
                    callback: async ()=>{
                        await Requests.delete_object("delete/claim/" + claim.id)
                        navigate("/families/" + family.id + '/claims')
                        reloadPage()
                    },
                    message: "Вы уверены, что хотите удалить это заявление? Настоящее действие нельзя будет отменить"
                });
                SetShowModal(1);
            }
        }
        
    ]
    

    const Windows  = {
        "form": {
            name: "Форма",
            Code: ()=>{ 
                const [newClaim, setNewClaim] = React.useState({...claim});
                return (
                    <Form>
                        <ClaimForm claim={newClaim} setClaim={setNewClaim} family={family}/>
                        <Button onClick={()=>{handleClaimUpload(newClaim);}}> Сохранить </Button>
                    </Form>
                )
            }
        },
        "metadata": {
            name: "Метадата",
            Code: ()=> (<ElementMetaForm element={claim} />)
        }
    }


    return (
        <>
        <NavBar name={"Заявление"} windows={Windows} actions={actions} location={location}/>
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Заявление</h5>
                <Routes>
                    <Route path="/" element={<Navigate replace to="form" />}/>
                    <Route path="/form" element={<Windows.form.Code/>}/>
                    <Route path="/metadata" element={<Windows.metadata.Code/>}/>
                </Routes>
            </div>
        </div>
        </>
    )
}