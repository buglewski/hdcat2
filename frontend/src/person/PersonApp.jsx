import React from "react";
import { PersonBody } from "./PersonBody";
import { PersonSideBar } from "./PersonSideBar";

export const PersonApp = function(props){
    const person = props.person
    const reloadPage = props.reloadPage
    const location = (props.location ?? "") + "/persons/" + person.id;
    
    
    
    return (
        <div className="row">
            <div className="col-3">
                <PersonSideBar person={person} location={location}/>
            </div>
            <div className="col-9">
                <PersonBody 
                    person = {person}
                    reloadPage = {reloadPage}
                    location =  {location}
                />
            </div>
        </div>
    )
}