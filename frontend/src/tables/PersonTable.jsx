import React from 'react';
import {PersonFullName} from '../utils/utils';
import classes from './Table.module.css'
import { useNavigate } from 'react-router-dom';

export const PersonTable = function(props){
    const navigate = useNavigate();
    return (
        <table className="table">
            <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Имя</th>
                <th scope="col">Дата рождения</th>
                <th scope="col">ДУЛ серия</th>
                <th scope="col">ДУЛ номер</th>
                <th scope="col">СНИЛС</th>
                <th scope="col">Комментарий</th>
            </tr>
            </thead>
            <tbody>
            {props.persons.map((person, index)=>(
                <tr className={classes.tableLine} key={person.id} onClick={()=>navigate("/persons/" + person.id) } >
                    <th scope="col"> {index+1} </th>
                    <td>{PersonFullName(person)}</td>
                    <td>{person.birthday}</td>
                    <td>{person.passport?.series ?? "Не найден"}</td>
                    <td>{person.passport?.number ?? "Не найден"}</td>
                    <td>{person.snils}</td>
                    <td>{person.comment}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}