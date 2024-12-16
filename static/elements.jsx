//const [newDocument, setNewDocument] = React.useState({});
//const [newSelectedFile, setNewSelectedFile] = React.useState(null);

const DocumentApp = function(props){
    const [CurrentRegime, SetCurrentRegime] = React.useState(0);
    const [document, setDocument] = React.useState(props.document ? props.document : {});
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [CurrentModal, SetCurrentModal] = [props.CurrentModal, props.SetCurrentModal]
    const [newDocument, setNewDocument] = React.useState({});
    const [newSelectedFile, setNewSelectedFile] = React.useState(null);

    const handleDocumentUpload = (document, selectedFile) => {
        //console.log(selectedFile[0])
        send_document(document, selectedFile)
    }
    
    const actions = [
        {
            name: "Новый документ",
            action: ()=>SetCurrentModal(1)
        }
    ]
    
    const regimes = [
        {
            name: "Форма",
            Container: (
                <form>
                <DocumentForm document={document} setDocument={setDocument} setSelectedFile={setSelectedFile}/>
                <ButtonForm 
                    value={"Сохранить"}
                    onClick={()=>{
                        handleDocumentUpload(document, selectedFile);
                    }}
                />
                </form>
            )
        },
        {
            name: "Метадата",
            Container : (<ElementMetaForm element={document} />)
        }
    ]

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

    let Container = regimes[CurrentRegime].Container;
    let name = regimes[CurrentRegime].name;
    
    return (
        <div>
        <NavBar name="Документ" regimes={regimes} actions={actions} SetCurrentRegime={SetCurrentRegime}/>
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{name}</h5>
                {Container}
            </div>
        </div>

        
        </div>
    )
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
  

const NavBar = function(props){
    //let current_regime = props.regimes[0]
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
            <a className="navbar-brand" href="#">{props.name}</a>
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
                        <li className="nav-item">
                        <a className="dropdown-item" href="#" onClick = {action.action}>{action.name}</a>
                        </li>
                    ))}
                    <li><a className="dropdown-item" href="#">Действие</a></li>
                    <li><a className="dropdown-item" href="#">Другое действие</a></li>
                    <li><hr className="dropdown-divider"/></li>
                    <li><a className="dropdown-item" href="#">Что-то еще здесь</a></li>
                    </ul>
                </li>
                {props.regimes.map((regime, index)=>(
                    <li className="nav-item">
                    <a className="nav-link" href="#" aria-current="page" onClick = {() => props.SetCurrentRegime(index)}>{regime.name}</a>
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

