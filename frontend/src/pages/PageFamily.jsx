import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { UseLoading } from '../utils/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { FamilyApp } from '../family/FamilyApp';
import { transformInputClaim } from '../utils/utils';


export const PageFamily = () => {
    const params = useParams();
    const navigate = useNavigate()

    const [family, setFamily] = React.useState({id: 0})
    const [reload, setReload] = React.useState(0);

    const reloadPage = () => setReload(reload+1);

    const [load, isLoading] = UseLoading (async ()=>{
        if (params.family_id > 0){
            let family = await Requests.make_request("get/family/" + params.family_id)
            for (let claim of family.claims){
                transformInputClaim(claim);
            }
            setFamily(family)
            console.log(family)
        }
    })

    useEffect(()=>{
        console.log("MEOW!")
        load();
    }, [reload, params])

    return (
        <>
        {!isLoading ? 
            (<FamilyApp family={family} reloadPage={reloadPage}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}