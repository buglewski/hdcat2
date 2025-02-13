import React, { useState, useEffect } from 'react';
import classes from './Suggest.module.css'
import { UseLoading } from '../utils/utils';
import Requests from '../utils/requests';
import { Button, Col, InputGroup, FloatingLabel, Form, Row } from 'react-bootstrap';
import { SETTINGS } from '../App';

export const DocumentForm = function(props){
    //console.log(props.document)
    const [document, setDocument, setSelectedFile] = [props.document, props.setDocument, props.setSelectedFile]
    const [focusedInput, setFocusedInput] = useState("")
    const withSearch = props.withSearch ?? false
    const [filteredSuggestions, setFiltredSuggestions] = useState([])

    const existedDocumentChosen = (withSearch && document.id) ?? false

    const [load, isLoading] = UseLoading (async ()=>{
        let documents = await Requests.make_request("get_documents?" + new URLSearchParams({...document, limit: 5}))
        setFiltredSuggestions(documents)
    })

    useEffect(()=>{
        if (withSearch){
            let t = setTimeout(()=>load(), 1000)
            return ()=>clearTimeout(t)
        }
    }, [document])

    const handleFileChange = (event) => { setSelectedFile(event.target.files) }
    const handleInputChange = (event)=>{
        if (existedDocumentChosen){
            document.id = undefined;
            document.file = undefined;
        }
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setDocument({
            ...document,
            [name]: value
        });
    }

    

    const Gnilozubka = ()=> (
        <ul className={classes['autocomplete-suggestions']}>
            {filteredSuggestions.map((suggestion, index) => (
            <li key={index} className={classes["autocomplete-suggestion"]} 
                onClick={() => {setDocument({...suggestion}); setFiltredSuggestions([])}} 
            >
                {suggestion.typename} {suggestion.title}
            </li>
            ))}
        </ul>
    )

    const onFocusHandle = (id)=>()=>setTimeout(()=>setFocusedInput(id), 200);
    const onBlurHandle = () => setTimeout(()=>setFocusedInput(""), 100)

    return (
        <>
        {existedDocumentChosen ? 
        <Row  className={"mb-3 " + classes.alert} onFocus={onFocusHandle("typename")} onBlur={onBlurHandle}>
        <Col sm="8">
            Выбран существующий документ. Любое изменение приведет к отмене этого выбора!
        </Col>
        <Col sm="4" className="d-grid gap-2">
            <Button variant="warning" id="button-addon1" size="sm" style={{margin: "0 0 0 0"}} onClick={()=>{setDocument({}); }}>
            Отменить выбор и отчистить
            </Button>
        </Col>
        </Row>
        : <></>}

        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("typename")} onBlur={onBlurHandle}>
        <Col sm="6">
            
            <FloatingLabel controlId="typename" label="Тип">
                <Form.Select aria-label="Тип" value={document.typename ?? ""} onChange={handleInputChange}>
                    <option value={""}>Выберите тип</option>
                    {SETTINGS.possible_document_typenames.map((val, i)=>(<option value={val} key={i}>{val}</option>))}
                </Form.Select>
            </FloatingLabel>
        </Col>
        <Col sm="6">
            <FloatingLabel controlId="title" label="Наименование">
            <Form.Control type="text" value={document.title ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        {"typename" === focusedInput && !existedDocumentChosen ? <Gnilozubka/> : <></>}
        </Row>

        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("series")} onBlur={onBlurHandle}>
        <Col sm="6">
            <FloatingLabel controlId="series" label="Серия">
            <Form.Control className={classes['autocomplete-input']} type="text" value={document.series ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        <Col sm="6">
            <FloatingLabel controlId="number" label="Номер">
            <Form.Control className={classes['autocomplete-input']} type="text" value={document.number ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        {"series" === focusedInput && !existedDocumentChosen ? <Gnilozubka/> : <></>}
        </Row>

        <Row  className={"mb-3 " + classes['autocomplete-container']} onFocus={onFocusHandle("issuer")} onBlur={onBlurHandle}>
        <Col sm="9">
            <FloatingLabel controlId="issuer" label="Выдан">
            <Form.Control as="textarea" style={{ height: '100px' }} className={classes['autocomplete-input']} type="text" value={document.issuer ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        <Col sm="3">
            <FloatingLabel controlId="issue_date" label="Дата выдачи">
            <Form.Control type="date" value={document.issue_date ?? ""}  
                onChange={handleInputChange} />
            </FloatingLabel>
        </Col>
        {"issuer" === focusedInput && !existedDocumentChosen ? <Gnilozubka/> : <></>}
        </Row>

        <FloatingLabel className="mb-3" controlId="comment" label="Комментарий">
            <Form.Control as="textarea" style={{ height: '100px' }} type="text" value={document.comment ?? ""}  onChange={handleInputChange}/>
        </FloatingLabel>
        {
            document.file && 
            <div className="mb-3">
                Файл:
                <a id="getfile" href={"/download/" + document.file}>{document.file}</a>
            </div>
        }
        {
            !existedDocumentChosen &&
            <Form.Group className="mb-3" controlId="formFile">
                <Form.Label>Загрузить файл</Form.Label>
                <Form.Control type="file" onChange={handleFileChange}/>
            </Form.Group>
        }
        </>

    )
}