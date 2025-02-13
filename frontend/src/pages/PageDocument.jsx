import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { FamilyClaimTable } from '../tables/FamilyClaimTable';
import { UseLoading } from '../utils/utils';
import { DocumentTable } from '../tables/DocumentTable';
import { useParams } from 'react-router-dom';
import { DocumentApp } from '../document/DocumentApp';


export const PageDocument = () => {
    const params = useParams();

    const [document, setDocument] = React.useState({})
    const [reload, setReload] = React.useState(0);

    const reloadPage = () => setReload(reload+1);

    const [load, isLoading, error] = UseLoading (async ()=>{
        let document = await Requests.make_request("get/document/" + params.document_id)
        setDocument(document)
    })

    useEffect(()=>{
        console.log("MEOW!")
        load();
    }, [reload])
    
    if (error) return (<h1>Ошибка: {error.status} {error.statusText}</h1>)

    return (
        <>
        {!isLoading ? 
            (<DocumentApp document={document} reloadPage={reloadPage}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}