// Modals

const EmptyModal = () => {}

const DocumentModal = (ModalButtonHandle, SetCurrentModal) =>{
    return () => {
        const [newDocument, setNewDocument] = React.useState({});
        const [newSelectedFile, setNewSelectedFile] = React.useState(null);
        return(<Modal 
            title="Создать документ" 
            content={(<DocumentForm 
                document={newDocument} 
                setDocument={setNewDocument} 
                setSelectedFile = {setNewSelectedFile} 
            />)}
            handleClose = {()=>SetCurrentModal(EmptyModal)} 
            handleSave = {ModalButtonHandle(newDocument, newSelectedFile)} 
        />)
    }
}

// Forms
const PersonForm = function(props){
    //console.log(props.document)
    const [person, setPerson] = [props.person, props.setPerson]
    const handleFileChange = (event) => { setSelectedFile(event.target.files) }
    const handleInputChange = (event)=>{
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setPerson({
            ...person,
            [name]: value
        });
    }

    return (
        <div>
        <div class="mb-3">
            <label for="lastname" class="form-label">Фамилия</label>
            <input type="text" class="form-control" id="lastname" value={person.lastname} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="firstname" class="form-label">Имя</label>
            <input type="text" class="form-control" id="firstname"  value={person.firstname} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="secondname" class="form-label">Отчество</label>
            <input type="text" class="form-control" id="secondname"  value={person.secondname} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="gender" class="form-label">Пол</label>
            <input type="text" class="form-control" id="gender"  value={person.gender} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="birthday" class="form-label">Дата рождения</label>
            <input type="date" class="form-control" id="birthday"  value={person.birthday} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="snils" class="form-label">СНИЛС</label>
            <input type="text" class="form-control" id="snils"  value={person.snils} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="phone" class="form-label">Телефон</label>
            <input type="text" class="form-control" id="phone"  value={person.phone} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="comment" class="form-label">Комментарий</label>
            <textarea class="form-control" id="comment" rows="3" value={person.comment} onChange={handleInputChange}></textarea>
        </div>

        </div>

    )
}


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
            <textarea class="form-control" id="comment" rows="3" value={document.comment} onChange={handleInputChange}></textarea>
        </div>
        {
            document.file && 
            <div class="mb-3">
                <label for="getfile" class="form-label">Файл:</label>
                <a id="getfile" href={"/download/" + document.file}>{document.file}</a>
            </div>
        }
        <div class="mb-3">
            <label for="formFile" class="form-label">Загрузить файл</label>
            <input class="form-control" type="file" id="formFile" onChange={handleFileChange} />
        </div>

        </div>

    )
}

const ClaimForm = function(props){
    const family_persons = props.family.family_persons
    const [claim, setClaim] = [props.claim, props.setClaim]
    const [claimType, setClaimType] = React.useState(claim.typename ? claim.typename : '1')
    
    const claims = new Map(Object.entries(SETTINGS.claims));
    const currentClaimType = claims.get(claimType);

    console.log(claim)

    if (claim.typename == undefined) claim.typename = '1'
    if (claim.actual == undefined) claim.actual = true
    if (claim.family_id == undefined) claim.family_id = props.family.id

    const handleInputChange = (event)=>{
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setClaim({
            ...claim,
            [name]: value
        });
    }
    const options = []
    claims.forEach((value, key)=>options.push(<option value={key}> {value.name} </option>))
    const cathegories = []
    currentClaimType.possible_cathegories.map((cathegory, index)=>{
        const suboptions = []
        cathegory.map((value, index)=>suboptions.push(<option value={value}> {value} </option>))
        cathegories.push(
            <div class="mb-3">
                <label for={"cathegory_"+index} class="form-label">{"Категория " + index} </label>
                <select id={"cathegory_"+index} class="form-select" value={claim["cathegory_"+index]} onChange={handleInputChange}>
                    <option value="">Без категории</option>
                    {suboptions}
                </select>
            </div>
        )
    })

    return (
        <>
        <div class="mb-3">
            <label for="typename" class="form-label">Тип</label>
            <select id="typename" class="form-select" value={claimType} onChange={(event)=>{
                setClaimType(event.target.value)
                handleInputChange(event)
            }}>
                {options}
            </select>
        </div>
        {cathegories}
        <div class="mb-3">
            <label for="filed_on" class="form-label">Дата подачи</label>
            <input type="datetime-local" class="form-control" id="filed_on"  value={claim.filed_on} onChange={handleInputChange}/>
        </div>
        <div class="mb-3">
            <label for="claimer_id" class="form-label">Заявитель</label>
            <select id="claimer_id" class="form-select" value={claim.claimer_id} onChange={handleInputChange}>
                <option value="">Без заявителя</option>
                {family_persons.map((family_person, index)=>(
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


const PersonHouseForm = function(props){
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
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value={personHouse.actual} onChange={handleInputChange} id="flexCheckDefault" />
                <label class="form-check-label" for="flexCheckDefault">
                    Актуально
                </label>
            </div>
        )
    }

    return (
        <>
        <div class="row g-3 align-items-center mb-3">
            <div class="col-2"> 
                <label for="relation" class="col-form-label">Отношение:</label> 
            </div>
            <div class="col-10">
                <input type="text" id="relation" class="form-control" value={personHouse.relation} onChange={handleInputChange}/>
            </div>
        </div>

        {actualline}        

        <div class="row g-3 align-items-center mb-3">
        <div class="col-2"> 
            <label for="date_from" class="col-form-label">От:</label> 
        </div>
        <div class="col-4">
            <input type="date" id="date_from" class="form-control" value={personHouse.date_from} onChange={handleInputChange}/>
        </div>
        <div class="col-2"> 
            <label for="date_to" class="col-form-label">До.:</label> 
        </div>
        <div class="col-4">
            <input type="date" id="date_to" class="form-control" value={personHouse.date_to} onChange={handleInputChange}/>
        </div>
        </div>        

        <div class="mb-3">
            <label for="comment" class="form-label">Комментарий</label>
            <textarea class="form-control" id="comment" rows="3" value={personHouse.comment} onChange={handleInputChange}></textarea>
        </div>
        </>
    )
}

const HouseForm = function(props){
    const [house, setHouse] = [props.house, props.setHouse]
    
    const handleInputChange = (event)=>{
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.id;
    
        setHouse({
            ...house,
            [name]: value
        });
    }
    let arealine = (<></>);
    if (props.witharea){
        arealine = (
            <div class="row g-3 align-items-center mb-3">
                <div class="col-2"> 
                    <label for="area" class="col-form-label">Площадь:</label> 
                </div>
                <div class="col-10">
                    <input type="number" id="area" class="form-control" value={house.area} onChange={handleInputChange}/>
                </div>
            </div>
        )
    }

    return (
        <>
        <div class="row g-3 align-items-center mb-3">
        <div class="col-2"> 
            <label for="region" class="col-form-label">Регион:</label> 
        </div>
        <div class="col-10">
            <input type="text" id="region" class="form-control" value={house.region} onChange={handleInputChange}/>
        </div>
        </div>

        <div class="row g-3 align-items-center mb-3">
            <div class="col-2"> 
                <label for="city" class="col-form-label">Город:</label> 
            </div>
            <div class="col-10">
                <input type="text" id="city" class="form-control" value={house.city} onChange={handleInputChange}/>
            </div>
        </div>

        <div class="row g-3 align-items-center mb-3">
        <div class="col-2"> 
            <label for="prefix" class="col-form-label">Префикс:</label> 
        </div>
        <div class="col-2">
            <input type="text" id="prefix" class="form-control" value={house.prefix} onChange={handleInputChange}/>
        </div>
        <div class="col-2"> 
            <label for="street" class="col-form-label">Ул.:</label> 
        </div>
        <div class="col-6">
            <input type="text" id="street" class="form-control" value={house.street} onChange={handleInputChange}/>
        </div>
        </div>
        <div class="row g-3 align-items-center mb-3">
        <div class="col-2"> 
            <label for="house" class="col-form-label">Дом:</label> 
        </div>
        <div class="col-4">
            <input type="text" id="house" class="form-control" value={house.house} onChange={handleInputChange}/>
        </div>
        <div class="col-2"> 
            <label for="flat" class="col-form-label">Кв.:</label> 
        </div>
        <div class="col-4">
            <input type="text" id="flat" class="form-control" value={house.flat} onChange={handleInputChange}/>
        </div>
        </div>

        {arealine}

        <div class="mb-3">
            <label for="comment" class="form-label">Комментарий</label>
            <textarea class="form-control" id="comment" rows="3" value={house.comment} onChange={handleInputChange}></textarea>
        </div>

        </>

    )
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