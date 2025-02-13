import '../App.css';
import React, { useEffect } from 'react';
import API from '../api_info';
import Requests from '../utils/requests';
import { UseLoading } from '../utils/utils';
import { PersonTable } from '../tables/PersonTable';
import { Form } from 'react-bootstrap';


export const PagePersons = () => {
    const [persons, setPersons] = React.useState({})
    const [findQuery, setFindQuery] = React.useState("")

    const [load, isLoading] = UseLoading (async ()=>{
        let persons = await Requests.make_request("get_persons?" + new URLSearchParams({text: findQuery}))
        setPersons(persons)
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
            (<PersonTable persons={persons}/>)
            : (<div> Загрузка</div>)}
        </>
    );
}