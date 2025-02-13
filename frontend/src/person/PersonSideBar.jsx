import React from "react";
import { PersonFullName, HouseFullAddress } from "../utils/utils";
import { Link } from "react-router-dom";

export const PersonSideBar = function(props){
    const person = props.person;
    const DocumentClickHandle = props.DocumentClickHandle;
    const PersonClickHandle = props.PersonClickHandle ? props.PersonClickHandle : ()=>{};
    const role = props.role ? " - " + props.role : ""
    const location = props.location

    return (
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">
                <Link to={location}>
                    {PersonFullName(person)} ({person.birthday}) {role}
                </Link>
                </h6>
                <div>
                    {person.passport ? person.passport.typename + " " + person.passport.series + " " + person.passport.number + " Выдан: " + person.passport.issuer + " Дата выдачи: " +  person.passport.issue_date: "Паспорт не найден"}
                </div>
                <div>
                    Адрес регистрации: {person.housereg ? HouseFullAddress(person.housereg) : "Не найден"}
                </div>
                <div>
                    Адрес фактического проживания: {person.housefact ? HouseFullAddress(person.housefact) : "Не найден"}
                </div>
                <details>
                <summary>Документы</summary>
                {person.documents.map((document, index)=>(
                    <li>
                    <Link to = {location+"/documents/"+document.id}>
                        {document.typename} 
                        {document.title ? " (" + document.title + ")" : ""}
                        {document.issue_date ? " от " + document.issue_date : ""}
                    </Link>
                    </li>
                ))}
                </details>
            
            </div>
        </div>
    )
}