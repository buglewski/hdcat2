import React from 'react';
import classes from './Table.module.css'
import { useNavigate } from 'react-router-dom';
import { HouseFullAddress } from '../utils/utils';

export const HouseTable = function(props){
    const navigate = useNavigate();
    return (
        <table className="table">
            <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Адрес</th>
                <th scope="col">Комментарий</th>
            </tr>
            </thead>
            <tbody>
            {props.houses.map((house, index)=>(
                <tr className={classes.tableLine} key={house.id} onClick={()=>navigate("/houses/" + house.id) } >
                    <th scope="col"> {index+1} </th>
                    <td>{HouseFullAddress(house)}</td>
                    <td>{house.comment}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}