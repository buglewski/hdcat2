const DocumentForm = function(props){
    //console.log(props.document)
    const [document, setDocument, setSelectedFile] = [props.document, props.setDocument, props.setSelectedFile]
    const handleFileChange = (event) => { setSelectedFile(event.target.files) }
    const handleInputChange = (event)=>{
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setDocument({
            ...document,
            [name]: value
        });
    }

    return (
        <div>
        <div class="mb-3">
            <label for="typename" class="form-label">Тип</label>
            <input type="text" class="form-control" id="typename"
                value={document.typename} onChange={handleInputChange}
            />
        </div>
        <div class="mb-3">
            <label for="title" class="form-label">Наименование</label>
            <input type="text" class="form-control" id="title"  value={document.title} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="series" class="form-label">Серия</label>
            <input type="text" class="form-control" id="series"  value={document.series} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="number" class="form-label">Номер</label>
            <input type="text" class="form-control" id="number"  value={document.number} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="issuer" class="form-label">Выдан</label>
            <input type="text" class="form-control" id="issuer"  value={document.issuer} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="issue_date" class="form-label">Дата выдачи</label>
            <input type="date" class="form-control" id="issue_date"  value={document.issue_date} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="comment" class="form-label">Комментарий</label>
            <input type="textarea" class="form-control" id="comment"  value={document.comment} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="formFile" class="form-label">Файл</label>
            <input class="form-control" type="file" id="formFile" onChange={handleFileChange} />
        </div>

        </div>

    )
}

DocumentForm.defaultProps = {
    document: null
}


const ButtonForm = function(props){
    return (
        <div>
            <input type="button" class="btn btn-primary" {...props}/>
        </div>
    )
}

const ElementMetaForm = function(props){
    return (
        <div>
            <div class="mb-3 row">
            <label for="id" class="col-sm-2 col-form-label">id: </label>
            <div class="col-sm-10">
            <input type="text" readonly class="form-control-plaintext" id="id" value={props.element.id}/>
            </div>
            </div>
            <div class="mb-3 row">
            <label for="created_on" class="col-sm-2 col-form-label">Дата создания: </label>
            <div class="col-sm-10">
            <input type="datetime" readonly class="form-control-plaintext" id="created_on" value={props.element.created_on}/>
            </div>
            </div>
            <div class="mb-3 row">
            <label for="created_by" class="col-sm-2 col-form-label">Создан: </label>
            <div class="col-sm-10">
            <input type="text" readonly class="form-control-plaintext" id="created_by" value={props.element.created_by}/>
            </div>
            </div>
            <div class="mb-3 row">
            <label for="updated_on" class="col-sm-2 col-form-label">Дата изменения: </label>
            <div class="col-sm-10">
            <input type="datetime" readonly class="form-control-plaintext" id="updated_on" value={props.element.updated_on}/>
            </div>
            </div>
            <div class="mb-3 row">
            <label for="updated_by" class="col-sm-2 col-form-label">Изменен: </label>
            <div class="col-sm-10">
            <input type="text" readonly class="form-control-plaintext" id="updated_by" value={props.element.updated_by}/>
            </div>
            </div>
        </div>
    )
}