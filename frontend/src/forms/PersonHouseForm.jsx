import React from "react";

export const PersonHouseForm = function(props){
    const [personHouse, setPersonHouse] = [props.personHouse, props.setPersonHouse]
    const handleInputChange = (event)=>{
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setPersonHouse({
            ...personHouse,
            [name]: value
        });
    }

    let actualline = (<></>);
    if (props.withactual){
        actualline = (
            <div className="form-check">
                <input className="form-check-input" type="checkbox" value={personHouse.actual} onChange={handleInputChange} id="flexCheckDefault" />
                <label className="form-check-label" for="flexCheckDefault">
                    Актуально
                </label>
            </div>
        )
    }

    return (
        <>
        <div className="row g-3 align-items-center mb-3">
            <div className="col-2"> 
                <label for="relation" className="col-form-label">Отношение:</label> 
            </div>
            <div className="col-10">
                <input type="text" id="relation" className="form-control" value={personHouse.relation ?? ""} onChange={handleInputChange}/>
            </div>
        </div>

        {actualline}        

        <div className="row g-3 align-items-center mb-3">
        <div className="col-2"> 
            <label for="date_from" className="col-form-label">От:</label> 
        </div>
        <div className="col-4">
            <input type="date" id="date_from" className="form-control" value={personHouse.date_from ?? ""} onChange={handleInputChange}/>
        </div>
        <div className="col-2"> 
            <label for="date_to" className="col-form-label">До.:</label> 
        </div>
        <div className="col-4">
            <input type="date" id="date_to" className="form-control" value={personHouse.date_to ?? ""} onChange={handleInputChange}/>
        </div>
        </div>        

        <div className="mb-3">
            <label for="comment" className="form-label">Комментарий</label>
            <textarea className="form-control" id="comment" rows="3" value={personHouse.comment ?? ""} onChange={handleInputChange}></textarea>
        </div>
        </>
    )
}