import React from "react";
import Requests from "../utils/requests";
import { useNavigate } from "react-router-dom";
import { PersonHouseForm } from "../forms/PersonHouseForm";
import { ButtonForm } from "../forms/ButtonForm";
import { ElementMetaForm } from "../forms/ElementMetaForm";
import { HouseFullAddress, PersonFullName } from "../utils/utils";

export const PersonHouseApp = function(props){
    const navigate = useNavigate()

    const [personHouse, setPersonHouse] = React.useState(props.personHouse);
    const reloadPage = props.reloadPage;
    const [CurrentWindow, SetCurrentWindow] = React.useState("form");

    console.log(personHouse)

    const onClickHouseHandle = () => navigate("/houses" + personHouse.house.id)
    const onClickPersonHandle = () => navigate("/persons" + personHouse.person.id)
    
    const HouseRegHandle = () => {
        Requests.send_person({id: personHouse.person_id, regaddr_id : personHouse.house_id})
        .then(()=>{
            reloadPage();
        })
    }
    const HouseFactHandle = () => {
        Requests.send_person({id: personHouse.person_id, factaddr_id : personHouse.house_id})
        .then(()=>{
            reloadPage();
        })
    }

    const onSwtitchClickHandle = (regime) => ()=>{ SetCurrentWindow(regime); }
    

    const onUpdateHandle = () => {
        Requests.send_person_house(personHouse)
        .then(
            ()=>{
                reloadPage()
            }
        )
    }

    const windows  = {
        "form": ()=>(
                <>
                    <PersonHouseForm personHouse={personHouse} setPersonHouse={setPersonHouse}/>
                    <ButtonForm value={"Сохранить"} onClick={onUpdateHandle}/>
                </>
        ),
        "metadata": ()=> (
            <ElementMetaForm element={personHouse} />
        )
    }

    let Container = windows[CurrentWindow]

    return (
        <div className="col-sm-6 mb-3 mb-sm-0">
            <div class="card">
            <div class="card-header">
                <div className="row">
                <div class="col-4">
                    <div className="dropdown text-center">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Действие
                            </a>
                            <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={HouseRegHandle}>Сделать адресом регистрации</a></li>
                            <li><a className="dropdown-item" href="#"onClick={HouseFactHandle}>Сделать адресом проживания</a></li>
                            </ul>
                    </div>
                
                </div>
                <div class="col-4 text-center"><a className="nav-link" href="#" onClick = {onSwtitchClickHandle("form")}>  {"Форма"}  </a> </div>
                <div class="col-4 text-center"><a className="nav-link" href="#" onClick = {onSwtitchClickHandle("metadata")}>  {"Метадата"}  </a> </div>
                </div>
            </div>
            <div class="card-body">
                <h6 class="card-subtitle mb-3">Адрес: <a href="#" onClick = {onClickHouseHandle}>  {HouseFullAddress(personHouse.house)}  </a></h6>
                <h6 class="card-subtitle mb-3">Персона: <a href="#" onClick = {onClickPersonHandle}>  {PersonFullName(personHouse.person)}  </a></h6>
                <Container/>
            </div>
            </div>
        </div>
    )
}