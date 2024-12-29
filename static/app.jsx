const App = function(){
    const urlParams = new URLSearchParams(window.location.search);
    const [CurrentBody, SetCurrentBody] = React.useState(<></>);
    const [ReloadBody, SetReloadBodyOld] = React.useState(true);
    const [CurrentModal, SetCurrentModal] = React.useState(0);

    const SetReloadBody = (w) => {
        if (w) {
            SetCurrentBody(<></>)
            SetReloadBodyOld(true)
        } else {
            SetReloadBodyOld(false)
        }
    }

    const CreateFamily = () => {
        create_family()
        .then((response)=>{
            window.history.pushState(null,'','?' + "family=" + response.content.id);
            SetReloadBody(true);
        })
    }

    const modals = [
        ()=> {return (<></>) },
        CreateDocumentModal(
            (response)=>{
                window.history.pushState(null,'','?' + "document=" + response.content.id);
                SetReloadBody(true);
                SetCurrentModal(0)
            },
            ()=>SetCurrentModal(0)
        ),
        CreatePersonModal(
            (response)=>{
                window.history.pushState(null,'','?' + "person=" + response.content.id);
                SetReloadBody(true);
                SetCurrentModal(0)
            },
            ()=>SetCurrentModal(0)
        ),
        CreateHouseModal(
            (response)=>{
                window.history.pushState(null,'','?' + "house=" + response.content.id);
                SetReloadBody(true);
                SetCurrentModal(0)
            },
            ()=>SetCurrentModal(0)
        )
    ]

    console.log(urlParams);
    if (ReloadBody){
        if (urlParams.has("documents")){
            make_request("get_documents")
            .then(documents => {
                SetCurrentBody(
                    <>
                        <NavBar name={"Документы"}/>
                        <DocumentTable documents={documents} SetReloadBody={SetReloadBody}/> 
                    </>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("persons")){
            make_request("get_persons")
            .then(persons => {
                SetCurrentBody(
                    <>
                        <NavBar name={"Персоны"}/>
                        <PersonTable persons={persons} SetReloadBody={SetReloadBody}/> 
                    </>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("houses")){
            make_request("get_houses")
            .then(houses => {
                SetCurrentBody(
                    <>
                        <NavBar name={"Жилые помещения"}/>
                        <HouseTable houses={houses} SetReloadBody={SetReloadBody}/> 
                    </>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("document")){
            make_request("get/document/" + urlParams.get("document"))
            .then(document => {
                SetCurrentBody(
                    <DocumentApp document={document} SetReloadBody={SetReloadBody}/>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("person")){
            make_request("get/person/" + urlParams.get("person"))
            .then(person => {
                SetCurrentBody(
                    <PersonApp person={person} SetReloadBody={SetReloadBody}/>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("house")){
            make_request("get/house/" + urlParams.get("house"))
            .then(house => {
                SetCurrentBody(
                    <HouseApp house={house} SetReloadBody={SetReloadBody}/>
                );
                SetReloadBody(false);
            })
        } else if (urlParams.has("family")){
            make_request("get/family/" + urlParams.get("family"))
            .then(family => {
                SetCurrentBody(
                    <FamilyApp family={family} SetReloadBody={SetReloadBody}/>
                );
                SetReloadBody(false);
            })
        } else {
            window.history.pushState(null,'','');
            make_request("get_families")
            .then(families => {
                SetCurrentBody(
                    <FamilyClaimTable families={families} SetReloadBody={SetReloadBody}/>  // элемент, который мы хотим создать
                );
                SetReloadBody(false);
            })
        }
    }

    let CModal = modals[CurrentModal];

    return (
        <div class="container meow">
        <CModal/>
        <AppNavBar SetReloadBody={SetReloadBody} SetCurrentModal={SetCurrentModal} CreateFamily={CreateFamily}/>
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
                            <li><a className="dropdown-item" href="#" onClick={props.CreateFamily}>Семью</a></li>
                            <li><a className="dropdown-item" href="#" onClick={()=>props.SetCurrentModal(1)}>Документ</a></li>
                            <li><a className="dropdown-item" href="#"onClick={()=>props.SetCurrentModal(2)}>Персону</a></li>
                            <li><a className="dropdown-item" href="#"onClick={()=>props.SetCurrentModal(3)}>Жилое помещение</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={handleLink("")}>Главная</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={handleLink("persons")}>Персоны</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={handleLink("houses")}>Жилые помещения</a>
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