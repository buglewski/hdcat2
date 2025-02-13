import React from "react"
import { SETTINGS } from "../App"
import { PersonFullName } from "../utils/utils"
import { Button, Col, InputGroup, FloatingLabel, Form, Row } from 'react-bootstrap';

export const ClaimForm = function(props){
    const family_persons = props.family.family_persons
    const [claim, setClaim] = [props.claim, props.setClaim]
    const [claimType, setClaimType] = React.useState(claim.typename ?? '1')
    
    const currentClaimType = SETTINGS.claims[claimType];

    

    claim.typename ??= '1'
    claim.actual ??= true
    claim.family_id ??= props.family.id
    claim.cathegories ??= new Array(currentClaimType.number_of_cathegories)

    const handleInputChange = (event)=>{
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setClaim({
            ...claim,
            [name]: value
        });
    }

    const handleInputChangeCathegory = (i)=>(event)=>{
        claim.cathegories[i] = event.target.value
        setClaim({
            ...claim,
            attributes : claim.cathegories.join("$")
        })
    }

    return (
        <>
        <FloatingLabel className="mb-3" controlId={"typename"} label={"Тип"} >
            <Form.Select aria-label="Тип" 
                        value={claimType} 
                        onChange={(event)=>{
                            setClaimType(event.target.value)
                            console.log(SETTINGS.claims[event.target.value].number_of_cathegories)
                            claim.cathegories = new Array(SETTINGS.claims[event.target.value].number_of_cathegories)
                            handleInputChange(event)
                        }}>
                {Object.keys(SETTINGS.claims).map((key, index)=>(<option value={key} key={index}> {SETTINGS.claims[key].name} </option>))}
            </Form.Select>
        </FloatingLabel>

        {currentClaimType.possible_cathegories.map((cathegory, index)=>(
            <FloatingLabel className="mb-3" controlId={"cathegory_"+index} label={"Категория " + (index+1)} key={index}>
                <Form.Select aria-label="Тип" value={claim.cathegories[index] ?? ""} onChange={handleInputChangeCathegory(index)}>
                    <option value={""}>Выберите категорию</option>
                    {cathegory.map((val, i)=>(<option value={val} key={i}>{val}</option>))}
                </Form.Select>
            </FloatingLabel>
            )
        )}
        <div class="mb-3">
            <label for="filed_on" class="form-label">Дата подачи</label>
            <input type="datetime-local" class="form-control" id="filed_on"  value={claim.filed_on} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="claimer_id" class="form-label">Заявитель</label>
            <select id="claimer_id" class="form-select" value={claim.claimer_id} onChange={handleInputChange}>
                <option value="">Без заявителя</option>
                {family_persons?.map((family_person, index)=>(
                    <option value={family_person.person.id}>{PersonFullName(family_person.person)}</option>
                ))}
            </select>
        </div>
        <div class="mb-3">
            <label for="response" class="form-label">Статус</label>
            <select id="response" class="form-select" value={claim.response} onChange={handleInputChange}>
                <option value={0}>На рассмотрении</option>
                <option value={1}>Удовлетворено</option>
                <option value={-1}>Отказано</option>
            </select>
        </div>
        {
            claim.response != 0 &&
            <div class="mb-3">
                <label for="response_description" class="form-label">Описание решение</label>
                <input type="textarea" class="form-control" id="response_description"  value={claim.response_description} onChange={handleInputChange}/>
            </div>
        }
        <div class="mb-3">
            <label for="comment" class="form-label">Комментарий</label>
            <textarea class="form-control" id="comment" rows="3" value={claim.comment} onChange={handleInputChange}></textarea>
        </div>

        <div class="form-check">
            <input class="form-check-input" type="checkbox" defaultChecked={claim.actual} value={claim.actual} onChange={handleInputChange} id="actual" />
            <label class="form-check-label" for="actual">
                Актуально
            </label>
        </div>

        </>

    )
}