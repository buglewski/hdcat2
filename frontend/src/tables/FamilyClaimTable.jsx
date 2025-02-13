import React from 'react';
import {PersonFullName, codeToStatus} from '../utils/utils';
import classes from './Table.module.css'
import { useNavigate } from 'react-router-dom';
import { SETTINGS } from '../App';

export const FamilyClaimTable = function(props){
    const navigate = useNavigate()
    return (
        <table className="table">
            <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Семья</th>
                <th scope="col">Заявления</th>
            </tr>
            </thead>
            <tbody>
            {props.families.map((fam, index)=>(
                
                <tr className={classes.tableLine} key={fam.id} onClick={()=>navigate("/families/" + fam.id) } >
                    <th scope="col"> {index+1} </th>
                    <td>
                        {fam.family_persons.map((fp, index)=>(
                            <div key = {fp.id}>
                                {PersonFullName(fp.person)}
                                <span style={{fontStyle : "italic"}}>
                                {fp.role ? "- " + fp.role : ""}
                                </span>
                                 
                            </div>
                        ))}
                    </td>
                    <td>
                        {fam.claims.map((claim, index)=>(
                            <div key={claim.id}>
                                <span style={{fontStyle : "italic"}}>
                                    {SETTINGS.claims[claim.typename].name}
                                </span> от {claim.filed_on} - 
                                <span style={{fontWeight : "bold"}}>{codeToStatus(claim.response)}</span>
                            </div>
                        ))}
                    </td>
                </tr>
                
            ))}
            </tbody>
        </table>
    )
}