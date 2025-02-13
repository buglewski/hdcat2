import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { FamilyClaimTable } from '../tables/FamilyClaimTable';
import { UseLoading } from '../utils/utils';
import { DocumentTable } from '../tables/DocumentTable';
import { useParams } from 'react-router-dom';
import { PersonApp } from '../person/PersonApp';


export const PagePerson = () => {
    const params = useParams();

    const [person, setPerson] = React.useState({})
    const [reload, setReload] = React.useState(0);

    const reloadPage = () => setReload(reload+1);

    const [load, isLoading, error] = UseLoading (async ()=>{
        let person = await Requests.make_request("get/person/" + params.person_id)
        setPerson(person)
    })

    useEffect(()=>{
        console.log("MEOW!")
        load();
    }, [reload])

    if (error) return (<h1>Ошибка: {error.status} {error.statusText}</h1>)

    return (
        <>
        {!isLoading ? 
            (<PersonApp person={person} reloadPage={reloadPage}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}