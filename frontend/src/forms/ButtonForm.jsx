import React from 'react';

export const ButtonForm = function(props){
    return (
        <div>
            <input type="button" className="btn btn-primary" {...props}/>
        </div>
    )
}