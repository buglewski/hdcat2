import React from 'react';

export const ElementMetaForm = function(props){
    return (
        <div>
            <div className="mb-3 row">
            <label for="id" className="col-sm-2 col-form-label">id: </label>
            <div className="col-sm-10">
            <input type="text" readOnly className="form-control-plaintext" id="id" defaultValue={props.element.id}/>
            </div>
            </div>
            <div className="mb-3 row">
            <label for="created_on" className="col-sm-2 col-form-label">Дата создания: </label>
            <div className="col-sm-10">
            <input type="datetime" readOnly className="form-control-plaintext" id="created_on" defaultValue={props.element.created_on}/>
            </div>
            </div>
            <div className="mb-3 row">
            <label for="created_by" className="col-sm-2 col-form-label">Создан: </label>
            <div className="col-sm-10">
            <input type="text" readOnly className="form-control-plaintext" id="created_by" defaultValue={props.element.created_by}/>
            </div>
            </div>
            <div className="mb-3 row">
            <label for="updated_on" className="col-sm-2 col-form-label">Дата изменения: </label>
            <div className="col-sm-10">
            <input type="datetime" readOnly className="form-control-plaintext" id="updated_on" defaultValue={props.element.updated_on}/>
            </div>
            </div>
            <div className="mb-3 row">
            <label for="updated_by" className="col-sm-2 col-form-label">Изменен: </label>
            <div className="col-sm-10">
            <input type="text" readOnly className="form-control-plaintext" id="updated_by" defaultValue={props.element.updated_by}/>
            </div>
            </div>
        </div>
    )
}