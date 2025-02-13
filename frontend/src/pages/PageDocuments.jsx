import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { FamilyClaimTable } from '../tables/FamilyClaimTable';
import { UseLoading } from '../utils/utils';
import { DocumentTable } from '../tables/DocumentTable';


export const PageDocuments = () => {
    const [documents, setDocuments] = React.useState({})

    const [load, isLoading] = UseLoading (async ()=>{
        let families = await Requests.make_request("get_documents")
        setDocuments(families)
    })

    useEffect(()=>{
        load();
    }, [])

    return (
        <>
        {!isLoading ? 
            (<DocumentTable documents={documents}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}