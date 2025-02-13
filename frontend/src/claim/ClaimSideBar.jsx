import React from "react"
import { SETTINGS } from "../App"
import { codeToStatus } from "../utils/utils";
import { Link } from "react-router-dom";

export const ClaimSideBar = function(props){
    const claim = props.claim;
    const location = props.location

    return (
        <div class="card">
            <div class="card-body">
                {codeToStatus(claim.response)}
                <h6 class="card-title">
                <Link to={location}>
                    {SETTINGS.claims[claim.typename].name}
                </Link>
                </h6>
                <div>Дата и время: {claim.filed_on} </div>
                {claim.cathegories?.map((val, i)=>(
                    <div>
                        Категория {i+1}: {val}
                    </div>
                ))}
            </div>
        </div>
    )
}
