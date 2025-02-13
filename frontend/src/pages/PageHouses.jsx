import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { UseLoading } from '../utils/utils';
import { HouseTable } from '../tables/HouseTable';

export const PageHouses = () => {
    const [houses, setHouses] = React.useState({})

    const [load, isLoading] = UseLoading (async ()=>{
        let houses = await Requests.make_request("get_houses")
        setHouses(houses)
    })

    useEffect(()=>{
        load();
    }, [])

    return (
        <>
        {!isLoading ? 
            (<HouseTable houses={houses}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}