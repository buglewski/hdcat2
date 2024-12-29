const FamilyApp = function(props){
    const SetReloadBody = props.SetReloadBody
    const [CurrentWindow, SetCurrentWindow] = React.useState("form");
    const [PersonWindow, SetPersonWindow] = React.useState("form");
    const [ClaimWindow, SetClaimWindow] = React.useState("form");
    const [CurrentModal, SetCurrentModal] = React.useState(0);
    const [family, setFamily] = React.useState(props.family ? props.family : {});
    const [CurrentPersonId, setCurrentPersonId] = React.useState(family.family_persons[0] && family.family_persons[0].person ? family.family_persons[0].person.id : 0);
    const [CurrentClaimId, SetCurrentClaimId] = React.useState(0);
    const [CurrentDocumentId, SetCurrentDocumentId] = React.useState(0);
    
    for (let claim of family.claims){
        transformInputClaim(claim);
    }

    const ReloadPage = () => {
        return new Promise((resolve, reject)=>{
            resolve(make_request("get/family/" + family.id)) 
        })
        .then((family)=>{setFamily(family)}) 
    }

    const modals = [
        ()=> (<></>),
        CreatePersonModal(
            (resp)=>{
                Promise.all([resp.content.id, send_family_person({family_id : family.id, person_id : resp.content.id, role : resp.additional.role})])
                .then( (results)=>{
                    setCurrentPersonId(results[0])
                    SetCurrentModal(0)
                    ReloadPage()
                })
                
            },
            ()=>SetCurrentModal(0),
            true
        ),
        ()=>{
            const [newFamilyPersons, setNewFamilyPersons] = React.useState([...family.family_persons]);
            const handleRole = (index, nrole)=>{
                const nextCounters = newFamilyPersons.map((fp, i) => {
                    if (i === index) {
                      return {...fp, role : nrole};
                    } else {
                      return fp;
                    }
                  });
                  setNewFamilyPersons(nextCounters);
            }

            return(<Modal 
                title="Установить роли" 
                content={
                    <>
                        {newFamilyPersons.map((family_person, index)=>(
                            <div class="mb-3 row">
                            <label for={"id"+index} class="col-sm-8 col-form-label">{PersonFullName(family_person.person)} </label>
                            <div class="col-sm-4">
                            <input type="text" class="form-control" id={"id"+index} value={family_person.role} 
                                onChange={
                                    (event)=>{handleRole(index, event.target.value)}
                                }/>
                            </div>
                            </div>
                        ))}
                    </>
                }
                handleClose = {()=>SetCurrentModal(0)} 
                handleSave = {()=>{
                    const promises = newFamilyPersons.map((fp, i)=>send_family_person({id : fp.id, role: fp.role}))
                    return Promise.all(promises)
                    .then(()=>{
                        SetCurrentModal(0)
                        ReloadPage()
                    })
                }} 
            />)
        },
        CreateClaimModal(
            (response)=>{
                setCurrentPersonId(response.content.id)
                SetCurrentModal(0)
                ReloadPage()
            },
            ()=>SetCurrentModal(0),
            family
        ),
    ]

    const actions = [
        [
            {
                name: "Добавить новую персону",
                action: ()=>SetCurrentModal(1)
            },
            {
                name: "Добавить новое заявление",
                action: ()=>SetCurrentModal(3)
            },
            {
                name: "Редактировать роли",
                action: ()=>SetCurrentModal(2)
            }
        ]
    ]
    
    
    const DocumentClickHandleByPerson = (person_id) => {
        return (document_id) => {
            return () => {
                setCurrentPersonId(person_id)
                SetCurrentDocumentId(document_id); SetPersonWindow("document"); 
            }
        }
    }

    const DocumentClickHandleByClaim = (claim_id) => {
        return (document_id) => {
            return () => {
                SetCurrentClaimId(claim_id)
                SetCurrentDocumentId(document_id); SetClaimWindow("document"); 
            }
        }
    }
    const PersonClickHandle = (person_id) => {
        return () => {
            setCurrentPersonId(person_id);
            SetPersonWindow("form");
        }
    }
    const ClaimClickHandle = (claim_id) => {
        return () => {
            SetCurrentClaimId(claim_id);
            SetClaimWindow("form");
        }
    }

    const windows  = {
        "form": ()=>{ 
            return (
                <div class="row">
                    <div class="col-3">
                        {family.family_persons.map((family_person, index)=>(
                            <PersonSideBar person={family_person.person} 
                                role={family_person.role}
                                DocumentClickHandle={DocumentClickHandleByPerson(family_person.person.id)}
                                PersonClickHandle={PersonClickHandle(family_person.person.id)}
                            />
                        ))}
                    </div>
                    {
                        CurrentPersonId > 0 &&
                        <div class="col-9">
                            <PersonBody SetReloadBody={SetReloadBody} 
                                CurrentWindow={PersonWindow} 
                                SetCurrentWindow={SetPersonWindow}
                                person = {getPersonByIdInFP(family.family_persons, CurrentPersonId)}
                                CurrentDocumentId = {CurrentDocumentId}
                                SetCurrentDocumentId = {SetCurrentDocumentId}
                                ReloadPage = {ReloadPage}
                            />
                        </div>
                    }
                </div>
            )
        },
        "claims": ()=>{ 
            return (
                <div class="row">
                    <div class="col-3">
                        {family.claims.map((claim, index)=>(
                            <ClaimSideBar claim={claim} 
                                DocumentClickHandle={DocumentClickHandleByClaim(claim.id)}
                                ClaimClickHandle={ClaimClickHandle(claim.id)}
                            />
                        ))}
                    </div>
                    {
                        CurrentClaimId > 0 &&
                        <div class="col-9">
                            <ClaimBody SetReloadBody={SetReloadBody} 
                                CurrentWindow={PersonWindow} 
                                SetCurrentWindow={SetPersonWindow}
                                claim = {getClaimById(family.claims, CurrentClaimId)}
                                family = {family}
                                CurrentDocumentId = {CurrentDocumentId}
                                SetCurrentDocumentId = {SetCurrentDocumentId}
                                ReloadPage = {ReloadPage}
                            />
                        </div>
                    }
                </div>
            )
        },
        "metadata": ()=>(<ElementMetaForm element={family} />)
    }

    const regimes = [
        {
            name: "Семья",
            action: ()=>SetCurrentWindow("form")
        },
        {
            name: "Заявления",
            action: ()=>{
                SetCurrentWindow("claims")
            }
        },
        {
            name: "Метадата",
            action : ()=>SetCurrentWindow("metadata")
        }
    ]

    const windowNames = {
        "form": "Семья",
        "claims": "Заявления",
        "metadata": "Метадата",
        "families": ""
    }

    let CModal = modals[CurrentModal];
    let Container = windows[CurrentWindow];
    let name = windowNames[CurrentWindow];
    

    return (
        <>
        <CModal/>
        <NavBar name={name} actions={actions} regimes={regimes}/>
        <div class="card">
            <div class="card-body">
                <Container/>
            </div>
        </div>
        </>
    )
}


const PersonApp = function(props){
    const SetReloadBody = props.SetReloadBody
    const [CurrentWindow, SetCurrentWindow] = React.useState("form");
    const [person, setPerson] = React.useState(props.person ? props.person : {});
    const [CurrentDocumentId, SetCurrentDocumentId] = React.useState(0);

    const ReloadPage = () => {
        return new Promise((resolve, reject)=>{
            resolve(make_request("get/person/" + person.id)) 
        })
        .then((person)=>{setPerson(person)}) 
    }
    
    const DocumentClickHandle = (document_id) => {
        return () => {SetCurrentDocumentId(document_id); SetCurrentWindow("document"); }
    }
    
    
    return (
        <div class="row">
            <div class="col-3">
                <PersonSideBar person={person} DocumentClickHandle={DocumentClickHandle}/>
            </div>
            <div class="col-9">
                <PersonBody 
                    SetReloadBody={SetReloadBody} 
                    CurrentWindow={CurrentWindow} 
                    SetCurrentWindow={SetCurrentWindow}
                    person = {person}
                    CurrentDocumentId = {CurrentDocumentId}
                    SetCurrentDocumentId = {SetCurrentDocumentId}
                    ReloadPage = {ReloadPage}
                />
            </div>
        </div>
    )
}

const PersonBody = function(props){
    const SetReloadBody = props.SetReloadBody
    const [CurrentWindow, SetCurrentWindow] = [props.CurrentWindow, props.SetCurrentWindow]
    const [CurrentModal, SetCurrentModal] = React.useState(0);
    const person = props.person
    const [CurrentDocumentId, SetCurrentDocumentId] = [props.CurrentDocumentId, props.SetCurrentDocumentId]
    const ReloadPage = props.ReloadPage

    console.log(person)

    const handlePersonUpload = (person) => {
        send_person(person)
        .then(() => {
            ReloadPage()
        })
    }

    const modals = [
        ()=> {return (<></>) },
        CreateDocumentModal(
            (response) => {
                send_person_document({person_id: person.id, document_id : response.content.id})
                .then(()=>{
                    SetCurrentModal(0)
                    SetCurrentWindow("document")
                    SetCurrentDocumentId(response.content.id)
                    ReloadPage()
                })
            },
            ()=>SetCurrentModal(0)
        ),
        () => {
            const [newHouse, setNewHouse] = React.useState({});
            const [newPersonHouse, setNewPersonHouse] = React.useState({});
            const [makeHouseReg, setMakeHouseReg] = React.useState(false)
            const [makeHouseFact, setMakeHouseFact] = React.useState(false)
            return(<Modal 
                title="Создать жилое помещение" 
                content={(
                    <>
                    <PersonHouseForm personHouse={newPersonHouse} setPersonHouse={setNewPersonHouse}/>
                    <HouseForm house={newHouse} setHouse={setNewHouse} />
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" checked={makeHouseReg} onChange={(event)=>{setMakeHouseReg(event.target.checked)}} id="mr" />
                        <label class="form-check-label" for="mr">
                            Сделать адресом регистрации
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" checked={makeHouseFact} onChange={(event)=>{setMakeHouseFact(event.target.checked)}} id="mf" />
                        <label class="form-check-label" for="mf">
                            Сделать адресом фактического проживания
                        </label>
                    </div>
                    </>
                )}
                handleClose = {()=>SetCurrentModal(0)} 
                handleSave = {()=>{
                    console.log(newHouse)
                    send_house(newHouse, setNewHouse)
                    .then((response)=>{
                        const promises = [send_person_house({person_id : person.id, house_id : response.content.id, ...newPersonHouse})]
                        if (makeHouseReg){
                            promises.push(send_person({id : person.id, regaddr_id : response.content.id}))
                        }
                        if (makeHouseFact){
                            promises.push(send_person({id : person.id, factaddr_id : response.content.id}))
                        }
                        return Promise.all(promises)
                    })
                    .then((result)=>{
                        SetCurrentModal(0)
                        setNewPersonHouse({})
                        setNewHouse({})
                        ReloadPage()
                    })
                }} 
            />)
        }
    ]

    const doc_actions = [
        {
            name: "Сделать док-м уд-м личность",
            action: ()=>{
                send_person({...person, passport_id : CurrentDocumentId})
                .then(() => {
                    ReloadPage()
                })
            }
        }
    ]

    const actions = [
        [
            {
                name: "Привязать новый документ",
                action: ()=>SetCurrentModal(1)
            },
            {
                name: "Привязать новое ж/п",
                action: ()=>SetCurrentModal(2)
            }
        ],
        
    ]
    
    const regimes = [
        {
            name: "Форма",
            action: ()=>SetCurrentWindow("form")
        },
        {
            name: "Жилые помещения",
            action : ()=>SetCurrentWindow("person_houses")
        },
        {
            name: "Семьи",
            action : ()=>SetCurrentWindow("families")
        },
        {
            name: "Метадата",
            action : ()=>SetCurrentWindow("metadata")
        },
    ]

    const windows  = {
        "form": ()=>{ 
            const [newPerson, setNewPerson] = React.useState({...person});
            return (
                <form>
                    <PersonForm person={newPerson} setPerson={setNewPerson}/>
                    <ButtonForm 
                        value={"Сохранить"}
                        onClick={()=>{
                            handlePersonUpload(newPerson);
                        }}
                    />
                </form>
            )
        },
        "document": ()=>(
            <DocumentApp SetReloadBody={SetReloadBody} 
                document={getDocumentById(person.documents, CurrentDocumentId)} 
                ReloadPage={ReloadPage}
                doc_actions={doc_actions}
            />
        ),
        "families": ()=>{
            const families = new Array(person.family_persons.length)
            for (let i in person.family_persons){
                families[i] = person.family_persons[i].family
            }
            return (
                <>
                    <FamilyClaimTable families={families} SetReloadBody={SetReloadBody}/>
                </>
            )
        },
        "person_houses": () => {
            console.log(person.person_houses)
            return (
                <div class="row">
                    {person.person_houses.map((person_house, index)=>(
                        <PersonHouseApp personHouse={person_house} ReloadPage={ReloadPage} SetReloadBody={SetReloadBody}/>
                    ))}
                </div>
            )
        },
        "metadata": ()=>(<ElementMetaForm element={person} />)
    }

    const windowNames = {
        "form": "Форма",
        "metadata": "Метадата",
        "document": "",
        "person_houses": "Жилые помещения",
        "families": "Семьи"
    }

    let Container = windows[CurrentWindow];
    let name = windowNames[CurrentWindow];
    let CModal = modals[CurrentModal];

    return (
        <>
        <CModal/>
        <NavBar name={PersonFullName(person)} regimes={regimes} actions={actions} />
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{name}</h5>
                <Container/>
            </div>
        </div>
        </>
    )
}

const PersonSideBar = function(props){
    const person = props.person;
    const DocumentClickHandle = props.DocumentClickHandle;
    const PersonClickHandle = props.PersonClickHandle ? props.PersonClickHandle : ()=>{};
    const role = props.role ? " - " + props.role : ""

    return (
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">
                <a href="#" onClick = {PersonClickHandle}>
                    {PersonFullName(person)} ({person.birthday}) {role}
                </a>
                </h6>
                <div>
                    {person.passport ? person.passport.typename + " " + person.passport.series + " " + person.passport.number + " Выдан: " + person.passport.issuer + " Дата выдачи: " +  person.passport.issue_date: "Паспорт не найден"}
                </div>
                <div>
                    Адрес регистрации: {person.housereg ? HouseFullAddress(person.housereg) : "Не найден"}
                </div>
                <div>
                    Адрес фактического проживания: {person.housefact ? HouseFullAddress(person.housefact) : "Не найден"}
                </div>
                <details>
                <summary>Документы</summary>
                {person.documents.map((document, index)=>(
                    <li>
                    <a href="#" onClick = {DocumentClickHandle(document.id)}>
                        {document.typename} 
                        {document.title ? " (" + document.title + ")" : ""}
                        {document.issue_date ? " от " + document.issue_date : ""}
                    </a>
                    </li>
                ))}
                </details>
            
            </div>
        </div>
    )
}


const ClaimBody = function(props){
    const SetReloadBody = props.SetReloadBody
    const [CurrentWindow, SetCurrentWindow] = [props.CurrentWindow, props.SetCurrentWindow]
    const [CurrentModal, SetCurrentModal] = React.useState(0);
    const claim = props.claim
    const family = props.family
    const [CurrentDocumentId, SetCurrentDocumentId] = [props.CurrentDocumentId, props.SetCurrentDocumentId]
    const ReloadPage = props.ReloadPage

    const handleClaimUpload = (claim) => {
        send_claim(claim)
        .then(() => {
            ReloadPage()
        })
    }

    const modals = [
        ()=> {return (<></>) },
        CreateDocumentModal(
            (response) => {
                send_claim_document({claim_id: claim.id, document_id : response.content.id})
                .then(()=>{
                    SetCurrentModal(0)
                    SetCurrentWindow("document")
                    SetCurrentDocumentId(response.content.id)
                })
            },
            ()=>SetCurrentModal(0)
        )
    ]

    const doc_actions = [ ]

    const actions = [
        [
            {
                name: "Привязать новый документ",
                action: ()=>SetCurrentModal(1)
            }
        ],
        
    ]
    
    const regimes = [
        {
            name: "Форма",
            action: ()=>SetCurrentWindow("form")
        },
        {
            name: "Метадата",
            action : ()=>SetCurrentWindow("metadata")
        },
    ]

    const windows  = {
        "form": ()=>{ 
            const [newClaim, setNewClaim] = React.useState({...claim});
            return (
                <form>
                    <ClaimForm claim={newClaim} setClaim={setNewClaim} family={family}/>
                    <ButtonForm 
                        value={"Сохранить"}
                        onClick={()=>{
                            handleClaimUpload(newClaim);
                        }}
                    />
                </form>
            )
        },
        "document": ()=>(
            <DocumentApp SetReloadBody={SetReloadBody} 
                document={getDocumentById(claim.documents, CurrentDocumentId)} 
                ReloadPage={ReloadPage}
                doc_actions={doc_actions}
            />
        ),
        "metadata": ()=>(<ElementMetaForm element={claim} />)
    }

    const windowNames = {
        "form": "Форма",
        "metadata": "Метадата",
        "document": ""
    }

    let Container = windows[CurrentWindow];
    let name = windowNames[CurrentWindow];
    let CModal = modals[CurrentModal];

    return (
        <>
        <CModal/>
        <NavBar name={"Заявление"} regimes={regimes} actions={actions} />
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{name}</h5>
                <Container/>
            </div>
        </div>
        </>
    )
}

const ClaimSideBar = function(props){
    const claim = props.claim;
    const DocumentClickHandle = props.DocumentClickHandle;
    const ClaimClickHandle = props.ClaimClickHandle ? props.ClaimClickHandle : ()=>{};

    return (
        <div class="card">
            <div class="card-body">
                {codeToStatus(claim.response)}
                <h6 class="card-title">
                <a href="#" onClick = {ClaimClickHandle}>
                    {SETTINGS.claims[claim.typename].name}
                </a>
                </h6>
                <div>Дата и время: {claim.filed_on} </div>
                {SETTINGS.claims[claim.typename].possible_cathegories.map((val, i)=>(
                    <div>
                        Категория {i}: {claim['cathegory_'+i]}
                    </div>
                ))}
                <details>
                <summary>Документы</summary>
                {claim.documents.map((document, index)=>(
                    <li>
                    <a href="#" onClick = {DocumentClickHandle(document.id)}>
                        {document.typename} 
                        {document.title ? " (" + document.title + ")" : ""}
                        {document.issue_date ? " от " + document.issue_date : ""}
                    </a>
                    </li>
                ))}
                </details>
            
            </div>
        </div>
    )
}


const HouseApp = function(props){
    const SetReloadBody = props.SetReloadBody
    const [CurrentWindow, SetCurrentWindow] = React.useState("form");
    const [house, setHouse] = React.useState(props.house);
    const house_actions = props.house_actions ? props.house_actions : []

    const DefaultReloadPage = () => {
        return new Promise((resolve, reject)=>{
            resolve(make_request("get/house/" + house.id)) 
        })
        .then((h)=>{setHouse(h)}) 
    }

    const ReloadPage = props.ReloadPage ? props.ReloadPage : DefaultReloadPage
        
    const handleHouseUpload = (house) => {
        send_house(house)
        .then(()=>ReloadPage())
    }

    const nameOnClick = () => {
        window.history.pushState(null,'','?' + "house="+house.id);
            props.SetReloadBody(true)
    }
    
    const actions = [
        house_actions,
        [
            {
                name: "Удалить",
                action: ()=>{}
            }
        ]
    ]

    const windows  = {
        "form": ()=>{ 
            const [newHouse, setNewHouse] = React.useState({...house});
            return (
                <form>
                    <HouseForm house={newHouse} setHouse={setNewHouse} witharea={true}/>
                    <ButtonForm 
                        value={"Сохранить"}
                        onClick={()=>{
                            handleHouseUpload(newHouse);
                        }}
                    />
                </form>
            )
        },
        "metadata": ()=> (
            <ElementMetaForm element={house} />
        )
    }

    const windowNames = {
        "form": "Форма",
        "metadata": "Метадата"
    }
    
    const regimes = [
        {
            name: "Форма",
            action: ()=>SetCurrentWindow("form")
        },
        {
            name: "Метадата",
            action : ()=>SetCurrentWindow("metadata")
        }
    ]

    let Container = windows[CurrentWindow];
    let name = windowNames[CurrentWindow];
    
    return (
        <div>
        <NavBar name="Жилое помещение" regimes={regimes} actions={actions} nameOnClick={nameOnClick}/>
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{name}</h5>
                <Container/>
            </div>
        </div>

        
        </div>
    )
}


const DocumentApp = function(props){
    const SetReloadBody = props.SetReloadBody
    const [CurrentWindow, SetCurrentWindow] = React.useState("form");
    const [document, setDocument] = React.useState(props.document);
    const doc_actions = props.doc_actions ? props.doc_actions : []

    const DefaultReloadPage = () => {
        return new Promise((resolve, reject)=>{
            resolve(make_request("get/document/" + document.id)) 
        })
        .then((doc)=>{setDocument(doc)}) 
    }

    const ReloadPage = props.ReloadPage ? props.ReloadPage : DefaultReloadPage
        
    const handleDocumentUpload = (document, selectedFile) => {
        send_document(document, selectedFile)
        .then(()=>ReloadPage())
    }

    const nameOnClick = () => {
        window.history.pushState(null,'','?' + "document="+document.id);
            props.SetReloadBody(true)
    }
    
    const actions = [
        doc_actions,
        [
            {
                name: "Удалить",
                action: ()=>{}
            }
        ]
    ]

    const windows  = {
        "form": ()=>{ 
            const [newDocument, setNewDocument] = React.useState({...document});
            const [selectedFile, setSelectedFile] = React.useState(null);
            return (
                <form>
                    <DocumentForm document={newDocument} setDocument={setNewDocument} setSelectedFile={setSelectedFile}/>
                    <ButtonForm 
                        value={"Сохранить"}
                        onClick={()=>{
                            handleDocumentUpload(newDocument, selectedFile);
                        }}
                    />
                </form>
            )
        },
        "metadata": ()=> (
            <ElementMetaForm element={document} />
        )
    }

    const windowNames = {
        "form": "Форма",
        "metadata": "Метадата"
    }
    
    const regimes = [
        {
            name: "Форма",
            action: ()=>SetCurrentWindow("form")
        },
        {
            name: "Метадата",
            action : ()=>SetCurrentWindow("metadata")
        }
    ]

    let Container = windows[CurrentWindow];
    let name = windowNames[CurrentWindow];
    
    return (
        <div>
        <NavBar name="Документ" regimes={regimes} actions={actions} nameOnClick={nameOnClick}/>
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{name}</h5>
                <Container/>
            </div>
        </div>

        
        </div>
    )
}

const PersonHouseApp = function(props){
    const SetReloadBody = props.SetReloadBody
    const [personHouse, setPersonHouse] = React.useState(props.personHouse);
    const ReloadPage = props.ReloadPage;
    const [CurrentWindow, SetCurrentWindow] = React.useState("form");

    const onClickHouseHandle = () => {
        window.history.pushState(null,'','?' + "house=" + personHouse.house.id);
        SetReloadBody(true)
    }
    const onClickPersonHandle = () => {
        window.history.pushState(null,'','?' + "person=" + personHouse.person.id);
        SetReloadBody(true)
    }
    const HouseRegHandle = () => {
        send_person({id: personHouse.person_id, regaddr_id : personHouse.house_id})
        .then(()=>{
            ReloadPage();
        })
    }
    const HouseFactHandle = () => {
        send_person({id: personHouse.person_id, factaddr_id : personHouse.house_id})
        .then(()=>{
            ReloadPage();
        })
    }

    const onSwtitchClickHandle = (regime) => {
        return ()=>{
            SetCurrentWindow(regime);
        }
    }

    const onUpdateHandle = () => {
        send_person_house(personHouse)
        .then(
            ()=>{
                ReloadPage()
            }
        )
    }

    const windows  = {
        "form": ()=>{ 
            return (
                <>
                    <PersonHouseForm personHouse={personHouse} setPersonHouse={setPersonHouse}/>
                    <ButtonForm value={"Сохранить"} onClick={onUpdateHandle}/>
                </>
            )
        },
        "metadata": ()=> (
            <ElementMetaForm element={personHouse} />
        )
    }

    let Container = windows[CurrentWindow]

    return (
        <div className="col-sm-6 mb-3 mb-sm-0">
            <div class="card">
            <div class="card-header">
                <div className="row">
                <div class="col-4">
                    <div className="dropdown text-center">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Действие
                            </a>
                            <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={HouseRegHandle}>Сделать адресом регистрации</a></li>
                            <li><a className="dropdown-item" href="#"onClick={HouseFactHandle}>Сделать адресом проживания</a></li>
                            </ul>
                    </div>
                
                </div>
                <div class="col-4 text-center"><a className="nav-link" href="#" onClick = {onSwtitchClickHandle("form")}>  {"Форма"}  </a> </div>
                <div class="col-4 text-center"><a className="nav-link" href="#" onClick = {onSwtitchClickHandle("metadata")}>  {"Метадата"}  </a> </div>
                </div>
            </div>
            <div class="card-body">
                <h6 class="card-subtitle mb-3">Адрес: <a href="#" onClick = {onClickHouseHandle}>  {HouseFullAddress(personHouse.house)}  </a></h6>
                <h6 class="card-subtitle mb-3">Персона: <a href="#" onClick = {onClickPersonHandle}>  {PersonFullName(personHouse.person)}  </a></h6>
                <Container/>
            </div>
            </div>
        </div>
    )
}
  

const NavBar = function(props){
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
                    {props.actions.map((action_group, index)=>(
                        <>
                        {action_group.map((action, index)=>(
                            <li className="nav-item">
                            <a className="dropdown-item" href="#" onClick = {action.action}>{action.name}</a>
                            </li>
                        ))}
                        <li><hr className="dropdown-divider"/></li>
                        </>
                    ))}
                    </ul>
                </li>
                {props.regimes.map((regime, index)=>(
                    <li className="nav-item">
                    <a className="nav-link" href="#" aria-current="page" onClick = {regime.action}>{regime.name}</a>
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

