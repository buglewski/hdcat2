const codeToStatus = (code) => {
    if (code == 1) return "Удовлетворено"
    if (code == 0) return "На рассмотрении"
    if (code == -1) return "Отказано"
    return "Неизвестно"
}

const getPersonByIdInFP = (family_persons, id) => {
    for (let family_person of family_persons){
        if (family_person.person.id == id) return family_person.person
    }
    return {}
}

const getClaimById = (claims, id) => {
    for (let claim of claims){
        if (claim.id == id) return claim
    }
    return {}
}

const getDocumentById = (documents, id) => {
    for (let doc of documents){
        if (doc.id == id) return doc
    }
    return {}
}

const transformInputClaim = (claim) =>{
    if (claim.attributes == undefined) return
    const arr = claim.attributes.split("$")
    for (let a = 0; a < arr.length - 1; a++){
        claim['cathegory_'+a] = arr[a+1]
    }
}

const transformOutputClaim = (claim) =>{
    let i = 0;
    claim.attributes = ''
    for (let i=0; i < SETTINGS.claims[claim.typename].number_of_cathegories; i++){
        claim.attributes += '$' + claim['cathegory_'+i]
    }
}

const PersonFullName = function(person){
    if (person.secondname)
        return person.lastname + ' ' + person.firstname + ' ' + person.secondname
    else
        return person.lastname + ' ' + person.firstname
}

const HouseFullAddress = function(house){
    let ans = ''
    if (house.region) ans = ans + house.region + ', ';
    if (house.city) ans = ans + house.city + ', ';
    if (house.prefix) ans = ans + house.prefix + ' ';
    if (house.street) ans = ans + house.street + ' ';
    if (house.house) ans = ans + house.house;
    if (house.flat) ans = ans + '-' + house.flat;
    return ans;
}

const FamilyClaimTable = function(props){
    const handleLink = function(query){
        return () =>{
            window.history.pushState(null,'','?' + query);
            props.SetReloadBody(true)
        }
    }
    return (
        <table className="table">
            <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Семья</th>
            </tr>
            </thead>
            <tbody>
            {props.families.map((fam, index)=>(
                
                <tr>
                    <th scope="col"> <a href="#" onClick={handleLink("family="+fam.id)}> {index+1} </a> </th>
                    <td>
                        {fam.family_persons.map((fp, index)=>(
                            <div>
                                {PersonFullName(fp.person)} {fp.role ? "- " + fp.role : ""}
                            </div>
                        ))}
                    </td>
                    <td>
                        {fam.claims.map((claim, index)=>(
                            <div>
                                {SETTINGS.claims[claim.typename].name} от {claim.filed_on} - {codeToStatus(claim.response)}
                            </div>
                        ))}
                    </td>
                </tr>
                
            ))}
            </tbody>
        </table>
    )
}

const DocumentTable = function(props){
    const handleLink = function(query){
        return () =>{
            window.history.pushState(null,'','?' + query);
            props.SetReloadBody(true)
        }
    }
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
                <tr>
                    <th scope="col"> <a href="#" onClick={handleLink("document="+doc.id)}> {index+1} </a> </th>
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

const HouseTable = function(props){
    const handleLink = function(query){
        return () =>{
            window.history.pushState(null,'','?' + query);
            props.SetReloadBody(true)
        }
    }
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
                <tr>
                    <th scope="col"> <a href="#" onClick={handleLink("house="+house.id)}> {index+1} </a> </th>
                    <td>{HouseFullAddress(house)}</td>
                    <td>{house.comment}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}



const PersonTable = function(props){
    const handleLink = function(query){
        return () =>{
            window.history.pushState(null,'','?' + query);
            props.SetReloadBody(true)
        }
    }
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
                <tr>
                    <th scope="col"> <a href="#" onClick={handleLink("person="+person.id)}> {index+1} </a> </th>
                    <td>{PersonFullName(person)}</td>
                    <td>{person.birthday}</td>
                    <td>{person.passport ? person.passport.series : "Не найден"}</td>
                    <td>{person.passport ? person.passport.number : "Не найден"}</td>
                    <td>{person.snils}</td>
                    <td>{person.comment}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

const CreateDocumentModal =(handleSave, handleClose) => () => {
    const [newDocument, setNewDocument] = React.useState({});
    const [newSelectedFile, setNewSelectedFile] = React.useState(null);
    return(<Modal 
        title="Создать документ" 
        content={(<DocumentForm 
            document={newDocument} 
            setDocument={setNewDocument} 
            setSelectedFile = {setNewSelectedFile} 
        />)}
        handleClose = {handleClose} 
        handleSave = {()=>{
            send_document(newDocument, newSelectedFile)
            .then(handleSave)
            
        }} 
    />)
}

const CreateClaimModal = (handleSave, handleClose, family = {family_persons : []}) => () => {
    const [newClaim, setNewClaim] = React.useState({});
    return(<Modal 
        title="Создать заявление" 
        content={(<ClaimForm 
            claim={newClaim} 
            setClaim={setNewClaim} 
            family={family}
        />)}
        handleClose = {handleClose} 
        handleSave = {()=>{
            transformOutputClaim(newClaim)
            console.log(newClaim)
            send_claim(newClaim)
            .then(handleSave)
        }} 
    />)
}


const CreateHouseModal = (handleSave, handleClose) => () => {
    const [newHouse, setNewHouse] = React.useState({});
    return(<Modal 
        title="Создать жилое помещение" 
        content={(<HouseForm 
            house={newHouse} 
            setHouse={setNewHouse} 
            witharea={true}
        />)}
        handleClose = {handleClose} 
        handleSave = {()=>{
            console.log(newHouse)
            send_house(newHouse, setNewHouse)
            .then(handleSave)
        }} 
    />)
}

const CreatePersonModal = ( handleSave, handleClose, withrole=false) => () => {
    const [newPerson, setNewPerson] = React.useState({});
    const [role, setRole] = React.useState("");
    const [newDocument, setNewDocument] = React.useState({});
    const [newSelectedFile, setNewSelectedFile] = React.useState(null);
    const [newHouseReg, setNewHouseReg] = React.useState({});
    const [newHouseFact, setNewHouseFact] = React.useState({});
    const [withoutDock, setWithoutDock] = React.useState(false);
    const [withoutHouse, setWithoutHouse] = React.useState(false);
    const [FactRegEq, setFactRegEq] = React.useState(false);
    
    return(<Modal 
        title="Создать персону" 
        content={(
            <>
            {
                withrole &&
                <>
                <div class="mb-3">
                    <label for="role" class="form-label">Роль:</label>
                    <input type="textarea" class="form-control" id="role"  value={role} onChange={(event)=>setRole(event.target.value)}/>
                </div>
                </>
            }
            <h5 class="card-title">Персональные данные:</h5>
            <PersonForm person={newPerson} setPerson={setNewPerson}/>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" checked={withoutDock} onChange={(event)=>{setWithoutDock(event.target.checked)}} id="wd" />
                <label class="form-check-label" for="wd"> Без документа удостовряющего личность </label>
            </div>
            {
                !withoutDock &&
                <>
                <h5 class="card-title">Документ удостоверяющий личность:</h5>
                <DocumentForm document={newDocument} setDocument={setNewDocument} setSelectedFile = {setNewSelectedFile} />
                </>
            }
            <div class="form-check">
                <input class="form-check-input" type="checkbox" checked={withoutHouse} onChange={(event)=>{setWithoutHouse(event.target.checked)}} id="wh" />
                <label class="form-check-label" for="wh">Без адресов</label>
            </div>
            {   
                !withoutHouse &&
                <>
                <h5 class="card-title">Адрес регистрации:</h5>
                <HouseForm house={newHouseReg} setHouse={setNewHouseReg} />
                <h5 class="card-title">Адрес фактического проживания:</h5>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" checked={FactRegEq} onChange={(event)=>{setFactRegEq(event.target.checked)}} id="eq" />
                    <label class="form-check-label" for="eq">
                        Совпадает с адресом регистрации
                    </label>
                </div>
                {!FactRegEq && <HouseForm house={newHouseFact} setHouse={setNewHouseFact} />}
                </>
            }
            </>
        )}
        handleClose = {handleClose} 
        handleSave = {()=>{
            const promises = [0, 0, 0]
            if (!withoutDock) promises[0] = (send_document(newDocument, newSelectedFile))
            if (!withoutHouse) promises[1] = (send_house(newHouseReg))
            if (!withoutHouse && !FactRegEq) promises[2] = (send_house(newHouseFact))

            Promise.all(promises)
            .then((results)=>{
                if (!withoutDock) newPerson.passport_id = results[0].content.id;
                if (!withoutHouse) {
                    newPerson.regaddr_id = results[1].content.id;
                    if (FactRegEq){
                        newPerson.factaddr_id = results[1].content.id;
                    } else {
                        newPerson.А = results[2].content.id;
                    }
                }            
                return send_person(newPerson)
            }).then((resp)=>{
                const promises = [0, 0, 0]
                if (!withoutDock) promises[0] = (send_person_document({person_id : resp.content.id, document_id: newPerson.passport_id}))
                if (!withoutHouse) promises[1] = (send_person_house({person_id : resp.content.id, document_id: newPerson.regaddr_id}))
                if (!withoutHouse && !FactRegEq) promises[2] = (send_person_house({person_id : resp.content.id, document_id: newPerson.factaddr_id}))
                Promise.all(promises)
                resp.additional = {role : role}
                return resp
            }).then(handleSave)
            
        }} 
    />)
}



function Modal(props) {
    //const [show, setShow] = React.useState(true);
  
    //const handleClose = () => setShow(false);
    //const handleShow = () => setShow(true);
  
    return (
      <>  
        <ReactBootstrap.Modal show={true} onHide={props.handleClose}>
          <ReactBootstrap.Modal.Header closeButton>
            <ReactBootstrap.Modal.Title>{props.title}</ReactBootstrap.Modal.Title>
          </ReactBootstrap.Modal.Header>
          <ReactBootstrap.Modal.Body>{props.content}</ReactBootstrap.Modal.Body>
          <ReactBootstrap.Modal.Footer>
            <ReactBootstrap.Button variant="secondary" onClick={props.handleClose}>
              Close
            </ReactBootstrap.Button>
            <ReactBootstrap.Button variant="primary" onClick={props.handleSave}>
              Save Changes
            </ReactBootstrap.Button>
          </ReactBootstrap.Modal.Footer>
        </ReactBootstrap.Modal>
      </>
    );
  }


const Nothing = function(props){
    return (
        <div> Nothing </div>
    )
}