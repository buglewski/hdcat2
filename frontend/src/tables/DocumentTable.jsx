import React from 'react';
import classes from './Table.module.css'
import { useNavigate } from 'react-router-dom';

export const DocumentTable = function(props){
    const navigate = useNavigate()
    return (
        <table className="table">
            <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Тип</th>
                <th scope="col">Наименование</th>
                <th scope="col">Серия</th>
                <th scope="col">Номер</th>
                <th scope="col">Дата выдачи</th>
                <th scope="col">Кем выдан</th>
                <th scope="col">Комментарий</th>
            </tr>
            </thead>
            <tbody>
            {props.documents.map((doc, index)=>(
                <tr className={classes.tableLine} key={doc.id} onClick={()=>navigate("/documents/" + doc.id) } >
                    <th scope="col">  {index+1} </th>
                    <td>{doc.typename}</td>
                    <td>{doc.title}</td>
                    <td>{doc.series}</td>
                    <td>{doc.number}</td>
                    <td>{doc.issue_date}</td>
                    <td>{doc.issuer}</td>
                    <td>{doc.comment}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}