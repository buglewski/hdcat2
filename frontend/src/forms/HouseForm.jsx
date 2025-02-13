import React, {useState, useEffect} from "react";
import { UseLoading } from "../utils/utils";
import Requests from "../utils/requests";
import classes from './Suggest.module.css'
import { Button, Col, InputGroup, FloatingLabel, Form, Row } from 'react-bootstrap';

export const HouseForm = function(props){
    const [house, setHouse] = [props.house, props.setHouse]
    const [focusedInput, setFocusedInput] = useState("")
    const withSearch = props.withSearch ?? false
    const [filteredSuggestions, setFiltredSuggestions] = useState([])

    const existedHouseChosen = (withSearch && house.id) ?? false

    const [load, isLoading] = UseLoading (async ()=>{
        let houses = await Requests.make_request("get_houses?" + new URLSearchParams({...house, limit: 5}))
        setFiltredSuggestions(houses)
    })

    useEffect(()=>{
        if (withSearch){
            let t = setTimeout(()=>load(), 1000)
            return ()=>clearTimeout(t)
        }
    }, [house])
    
    const handleInputChange = (event)=>{
        if (existedHouseChosen){
            house.id = undefined;
        }
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setHouse({
            ...house,
            [name]: value
        });
    }

    const Gnilozubka = ()=> (
        <ul className={"mb-3 " + classes['autocomplete-suggestions']}>
            {filteredSuggestions.map((suggestion, index) => (
            <li key={index} className={classes["autocomplete-suggestion"]} 
                onClick={() => {setHouse({...suggestion}); setFiltredSuggestions([])}} 
            >
                {suggestion.city} {suggestion.prefix} {suggestion.street} {suggestion.house} {suggestion.flat}
            </li>
            ))}
        </ul>
    )

    const onFocusHandle = (id)=>()=>setTimeout(()=>setFocusedInput(id), 200);
    const onBlurHandle = () => setTimeout(()=>setFocusedInput(""), 100)

    let arealine = (<></>);
    if (props.witharea){
        arealine = (
            <FloatingLabel className="mb-3" controlId="area" label="Площадь">
                <Form.Control type="number" value={house.area ?? ""}  onChange={handleInputChange}/>
            </FloatingLabel>
        )
    }

    return (
        <>
        {existedHouseChosen ? 
        <Row  className={"mb-3 " + classes.alert} onFocus={onFocusHandle("typename")} onBlur={onBlurHandle}>
        <Col sm="8">
            Выбран существующий дом. Любое изменение приведет к отмене этого выбора!
        </Col>
        <Col sm="4" className="d-grid gap-2">
            <Button variant="warning" id="button-addon1" size="sm" onClick={()=>{setHouse({}); }}>
            Отменить выбор и отчистить
            </Button>
        </Col>
        </Row>
        : <></>}
        
        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("region")} onBlur={onBlurHandle}>
        <Col sm="6">
            <FloatingLabel controlId="region" label="Регион">
            <Form.Control className={classes['autocomplete-input']} type="text" value={house.region ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        <Col sm="6">
            <FloatingLabel controlId="city" label="Населенный пункт">
            <Form.Control className={classes['autocomplete-input']} type="text" value={house.city ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        {"region" === focusedInput && !existedHouseChosen ? <Gnilozubka/> : <></>}
        </Row>

        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("address")} onBlur={onBlurHandle}>

        <Col sm="2">
            <FloatingLabel controlId="prefix" label="Префикс">
                <Form.Control type="text" value={house.prefix ?? ""} onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        <Col sm="6">
            <FloatingLabel controlId="street" label="Улица">
                <Form.Control type="text" value={house.street ?? ""} onChange={handleInputChange}/>
            </FloatingLabel>
        </Col>
        <Col sm="2">
            <FloatingLabel controlId="house" label="Дом">
                <Form.Control type="text" value={house.house ?? ""} onChange={handleInputChange}/>
            </FloatingLabel>
        </Col>
        <Col sm="2">
            <FloatingLabel controlId="flat" label="Кв.">
                <Form.Control type="text" value={house.flat ?? ""} onChange={handleInputChange}/>
            </FloatingLabel>
        </Col>
        {"address" === focusedInput && !existedHouseChosen ? <Gnilozubka/> : <></>}
        </Row>

        {arealine}

        <FloatingLabel className="mb-3" controlId="comment" label="Комментарий">
            <Form.Control as="textarea" style={{ height: '100px' }} type="text" value={house.comment ?? ""}  onChange={handleInputChange}/>
        </FloatingLabel>

        </>

    )
}