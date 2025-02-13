import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { FamilyClaimTable } from '../tables/FamilyClaimTable';
import { UseLoading } from '../utils/utils';
import { DocumentTable } from '../tables/DocumentTable';
import { useParams } from 'react-router-dom';
import { HouseApp } from '../house/HouseApp';


export const PageHouse = () => {
    const params = useParams();

    const [house, setHouse] = React.useState({})
    const [reload, setReload] = React.useState(0);

    const reloadPage = () => setReload(reload+1);

    const [load, isLoading] = UseLoading (async ()=>{
        let house = await Requests.make_request("get/house/" + params.house_id)
        setHouse(house)
    })

    useEffect(()=>{
        console.log("MEOW!")
        load();
    }, [reload])

    return (
        <>
        {!isLoading ? 
            (<HouseApp house={house} reloadPage={reloadPage}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}