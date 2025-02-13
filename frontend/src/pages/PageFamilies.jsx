import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { FamilyClaimTable } from '../tables/FamilyClaimTable';
import { UseLoading } from '../utils/utils';
import { Form } from 'react-bootstrap';

export const PageFamilies = () => {
    const [families, setFamilies] = React.useState({})
    const [findQuery, setFindQuery] = React.useState("")

    const [load, isLoading] = UseLoading (async ()=>{
        let families = await Requests.make_request("get_families?" + new URLSearchParams({text: findQuery}))
        setFamilies(families)
    })

    useEffect(()=>{
        if (findQuery.length >= 3) {
            let t = setTimeout(()=>load(), 1000)
            return ()=>clearTimeout(t)
        } 
        if (findQuery.length == 0) {
            load()
        }
    }, [findQuery])

    return (
        <>
        <Form.Group className="mb-3" controlId="searchLine">
            <Form.Label>Поиск</Form.Label>
            <Form.Control type="text" value={findQuery}  onChange={(e)=>{setFindQuery(e.target.value)}}/>
        </Form.Group>
        {!isLoading ? 
            (<FamilyClaimTable families={families}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}