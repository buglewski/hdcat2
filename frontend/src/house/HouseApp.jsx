import React from "react";
import Requests from "../utils/requests";
import { HouseForm } from "../forms/HouseForm";
import { ButtonForm } from "../forms/ButtonForm";
import { ElementMetaForm } from "../forms/ElementMetaForm";
import { NavBar } from "../utils/Navbar";
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';


export const HouseApp = function(props){
    const [CurrentWindow, SetCurrentWindow] = React.useState("form");
    const house = props.house;
    const house_actions = props.house_actions ? props.house_actions : []
    const reloadPage = props.reloadPage
    const location = (props.location ?? "") + "/houses/" + house.id;
        
    const handleHouseUpload = (house) => {
        Requests.send_house(house)
        .then(()=>reloadPage())
    }
    
    const actions = [
        house_actions,
        [
            {
                name: "Удалить",
                action: ()=>{}
            }
        ]
    ]

    const Windows  = {
        "form": {
            name: "Форма",
            setter: ()=>SetCurrentWindow("form"),
            Code: ()=>{ 
                const [newHouse, setNewHouse] = React.useState({...house});
                return (
                    <form>
                        <HouseForm house={newHouse} setHouse={setNewHouse} witharea={true}/>
                        <ButtonForm 
                            value={"Сохранить"}
                            onClick={()=>{
                                handleHouseUpload(newHouse);
                            }}
                        />
                    </form>
                )
            },
        },
        "metadata": {
            name: "Метадата",
            setter: ()=>SetCurrentWindow("metadata"),
            Code: ()=> (<ElementMetaForm element={house} />)
        }
    }

    let Container = Windows[CurrentWindow];
    
    return (
        <>
        <NavBar name="Жилое помещение" windows={Windows} actions={actions} location={location}/>

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