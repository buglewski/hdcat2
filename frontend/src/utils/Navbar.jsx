import React from "react"
import { Link, NavLink } from "react-router-dom";

export const NavBar = function(props){
    const windows = props.windows;
    const location = props.location
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
            <a className="navbar-brand" href="#" onClick={props.nameOnClick}>{props.name}</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Переключатель навигации">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Действие
                    </a>
                    <ul className="dropdown-menu">
                    {props.actions.map((action, index)=>(
                        <li className="nav-item" key={index}>
                        <a className="dropdown-item" href="#" onClick = {action.action}>{action.name}</a>
                        </li>
                    ))}
                    </ul>
                </li>
                {Object.keys(windows).map((key, index)=>(
                    
                    <li className="nav-item" key = {index}>
                        {windows[key].hidden ? 
                        <></>
                        : <NavLink to={location+"/"+key} className="nav-link" aria-current="page">{windows[key].name}</NavLink>}
                    </li>
                ))}
                </ul>
            </div>
            </div>
        </nav>

    )
}

NavBar.defaultProps = {
    name: "Unknown",
    actions: [],
    regimes: []
}