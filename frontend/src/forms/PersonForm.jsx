import React, { useState, useEffect } from 'react';
import classes from './Suggest.module.css'
import { UseLoading } from '../utils/utils';
import Requests from '../utils/requests';
import { Button, Col, InputGroup, FloatingLabel, Form, Row } from 'react-bootstrap';

export const PersonForm = function(props){
    //console.log(props.document)
    const [person, setPerson] = [props.person, props.setPerson]
    const [focusedInput, setFocusedInput] = useState("")
    const withSearch = props.withSearch ?? false
    const [filteredSuggestions, setFiltredSuggestions] = useState([])

    const existedPersonChosen = (withSearch && person.id) ?? false

    const [load, isLoading] = UseLoading (async ()=>{
        let persons = await Requests.make_request("get_persons?" + new URLSearchParams({...person, limit: 5}))
        setFiltredSuggestions(persons)
    })

    useEffect(()=>{
        if (withSearch){
            let t = setTimeout(()=>load(), 1000)
            return ()=>clearTimeout(t)
        }
    }, [person])

    const handleInputChange = (event)=>{
        if (existedPersonChosen){
            person.id = undefined;
        }
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setPerson({
            ...person,
            [name]: value
        });
    }

    const Gnilozubka = ()=> (
        <ul className={"mb-3 " + classes['autocomplete-suggestions']}>
            {filteredSuggestions.map((suggestion, index) => (
            <li key={index} className={classes["autocomplete-suggestion"]} 
                onClick={() => {setPerson({...suggestion}); setFiltredSuggestions([])}} 
            >
                {suggestion.lastname} {suggestion.firstname} {suggestion.secondname}
            </li>
            ))}
        </ul>
    )

    const onFocusHandle = (id)=>()=>setTimeout(()=>setFocusedInput(id), 200);
    const onBlurHandle = () => setTimeout(()=>setFocusedInput(""), 100)

    return (
        <>
        {existedPersonChosen ? 
        <Row  className={"mb-3 " + classes.alert} onFocus={onFocusHandle("typename")} onBlur={onBlurHandle}>
        <Col sm="8">
            Выбрана существующая персона. Любое изменение приведет к отмене этого выбора!
        </Col>
        <Col sm="4" className="d-grid gap-2">
            <Button variant="warning" id="button-addon1" size="sm" onClick={()=>{setPerson({}); }}>
            Отменить выбор и отчистить
            </Button>
        </Col>
        </Row>
        : <></>}

        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("lastname")} onBlur={onBlurHandle}>
        <Col sm="12">
            <FloatingLabel controlId="lastname" label="Фамилия">
            <Form.Control className={classes['autocomplete-input']} type="text" value={person.lastname ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        {"lastname" === focusedInput && !existedPersonChosen ? <Gnilozubka/> : <></>}
        </Row>

        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("firstname")} onBlur={onBlurHandle}>
        <Col sm="6">
            <FloatingLabel controlId="firstname" label="Имя">
            <Form.Control className={classes['autocomplete-input']} type="text" value={person.firstname ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        <Col sm="6">
            <FloatingLabel controlId="secondname" label="Отчество">
            <Form.Control className={classes['autocomplete-input']} type="text" value={person.secondname ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        {"firstname" === focusedInput && !existedPersonChosen ? <Gnilozubka/> : <></>}
        </Row>

        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("other")} onBlur={onBlurHandle}>
        <Col sm="4">
            <FloatingLabel controlId="birthday" label="Дата рождения">
            <Form.Control className={classes['autocomplete-input']} type="date" value={person.birthday ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        <Col sm="4">
            <FloatingLabel controlId="snils" label="СНИЛС">
            <Form.Control className={classes['autocomplete-input']} type="text" value={person.snils ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        <Col sm="4">
            <FloatingLabel controlId="phone" label="Телефон">
            <Form.Control className={classes['autocomplete-input']} type="text" value={person.phone ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        {"other" === focusedInput && !existedPersonChosen ? <Gnilozubka/> : <></>}
        </Row>

        <FloatingLabel className="mb-3" controlId="comment" label="Комментарий">
            <Form.Control as="textarea" style={{ height: '100px' }} type="text" value={person.comment ?? ""}  onChange={handleInputChange}/>
        </FloatingLabel>

        </>

    )
}