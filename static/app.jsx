const App = function(){
    const urlParams = new URLSearchParams(window.location.search);
    const [CurrentBody, SetCurrentBody] = React.useState(<></>);
    const [ReloadBody, SetReloadBody] = React.useState(true);
    const [newDocument, setNewDocument] = React.useState({});
    const [newSelectedFile, setNewSelectedFile] = React.useState(null);
    const [CurrentModal, SetCurrentModal] = React.useState(0);

    const handleDocumentUpload = (document, selectedFile) => {
        //console.log(selectedFile[0])
        send_document(document, selectedFile)
    }

    const modals = [
        (<></>),
        (<Modal 
            title="Создать документ" 
            content={(<DocumentForm 
                document={newDocument} 
                setDocument={setNewDocument} 
                setSelectedFile = {setNewSelectedFile} />)}
            handleClose = {()=>SetCurrentModal(0)} 
            handleSave = {()=>{
                console.log(newDocument)
                handleDocumentUpload(newDocument, newSelectedFile)
                SetCurrentModal(0)
                setNewDocument({})
            }} 
        />)

    ]

    console.log(urlParams);
    if (ReloadBody){
        if (urlParams.has("documents")){
            const p = new Promise(function(resolve, reject){
                return resolve(make_request("get_documents"));
            }).then(documents => {
                SetCurrentBody(
                    <>
                        <NavBar name={"Документы"}/>
                        <DocumentTable documents={documents} SetReloadBody={SetReloadBody}/> 
                    </>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("persons")){
            const p = new Promise(function(resolve, reject){
                return resolve(make_request("get_persons"));
            }).then(persons => {
                SetCurrentBody(
                    <>
                        <NavBar name={"Персоны"}/>
                        <PersonTable persons={persons} SetReloadBody={SetReloadBody}/> 
                    </>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("document")){
            const p = new Promise(function(resolve, reject){
                return resolve(make_request("get_document/" + urlParams.get("document")));
            }).then(document => {
                SetCurrentBody(
                    <DocumentApp document={document} SetCurrentModal={SetCurrentModal}/>
                );
                SetReloadBody(false);
            })
        } else {
            window.history.pushState(null,'','');
            const p = new Promise(function(resolve, reject){
                return resolve(make_request("get_families"));
            }).then(families => {
                SetCurrentBody(
                    <FamilyClaimTable families={families}/>  // элемент, который мы хотим создать
                );
                SetReloadBody(false);
            })
        }
    }

    let modal = modals[CurrentModal];

    return (
        <div class="container meow">
        {modal}
        <AppNavBar SetReloadBody={SetReloadBody} SetCurrentModal={SetCurrentModal}/>
        {CurrentBody}
        </div>
    )

}


const AppNavBar = function(props){
    const handleLink = function(query){
        return () =>{
            window.history.pushState(null,'','?' + query);
            props.SetReloadBody(true)
        }
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <div className="navbar-brand">
                    <div> HDCAT2 </div>
                </div>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav" aria-controls="navbarNav"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Создать
                            </a>
                            <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={()=>props.SetCurrentModal(1)}>Документ</a></li>
                            <li><a className="dropdown-item" href="#">Другое действие</a></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><a className="dropdown-item" href="#">Что-то еще здесь</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={handleLink("")}>Главная</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={handleLink("persons")}>Персоны</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={handleLink("documents")}>Документы</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}