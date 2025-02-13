import './App.css';
import React, {useEffect} from 'react';
import Requests from './utils/requests';
import { PageFamilies } from './pages/PageFamilies';
import { PageFamily } from './pages/PageFamily';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { PageDocuments } from './pages/PageDocuments';
import { PageDocument } from './pages/PageDocument';
import { PagePersons } from './pages/PagePersons';
import { PagePerson } from './pages/PagePerson';
import { PageHouses } from './pages/PageHouses';
import { PageHouse } from './pages/PageHouse';
import useModal from './utils/Modal';
import logo192 from './logo192.png'
import { Container } from 'react-bootstrap';
import { UseLoading } from './utils/utils';

export const Context = React.createContext()

export let SETTINGS = {}

const App = function(){
  const [ModalElement, SetCurrentModalComponent, SetShowModal] = useModal();
  

  const [load, isLoading, error] = UseLoading (async ()=>{
    SETTINGS = await Requests.make_request("get_settings")
  })

  useEffect(()=>{
      load();
  }, [])

  console.log("REFRESH");

  //if (error) return (<h1>Ошибка: {error.status} {error.statusText}</h1>)

    

  return (
    <>
    {!isLoading ? 
      (<Container>
          <Context.Provider value={{"SetCurrentModalComponent" : SetCurrentModalComponent, "SetShowModal": SetShowModal}}>
          <BrowserRouter>
            <ModalElement/>
            <AppNavBar/>
            <Routes>
              <Route path="/" element={<PageFamilies/>} />
              <Route path="/families/:family_id/*" element={<PageFamily/>} />
              <Route path="/documents" element={<PageDocuments/>}/>
              <Route path="/documents/:document_id/*" element={<PageDocument/>}/>
              <Route path="/persons" element={<PagePersons/>}/>
              <Route path="/persons/:person_id/*" element={<PagePerson />}/>
              <Route path="/houses" element={<PageHouses/>}/>
              <Route path="/houses/:house_id/*" element={<PageHouse/>}/>
            </Routes>
          
          </BrowserRouter>
          </Context.Provider>
        </Container>)
      : (<div> Загрузка</div>)}
    </>
  );


}

const AppNavBar = function(props){
  const navigate = useNavigate()
  const context = React.useContext(Context);
  const [SetCurrentModalComponent, SetShowModal] = [context.SetCurrentModalComponent, context.SetShowModal];
  const CreateFamily = () => {
      navigate("/families/0")
  }
  const OpenCreateDocumentModal = ()=>{
    SetCurrentModalComponent({name: "CreateDocumentModal", callback: (document_id)=>{
      navigate("/documents/" + document_id)
    }});
    SetShowModal(1);
  }
  const OpenCreateHouseModal = ()=>{
    SetCurrentModalComponent({name: "CreateHouseModal", callback: (house_id)=>{
      navigate("/houses/" + house_id)
    }});
    SetShowModal(1);
  }
  const OpenCreatePersonModal = ()=>{
    SetCurrentModalComponent({name: "CreatePersonModal", callback: (person_id)=>{
      navigate("/persons/" + person_id)
    }});
    SetShowModal(1);
  }
  return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
              <div className="navbar-brand">
                  <img src={logo192} width="40"/>
                  HDCAT2 
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
                          <li><a className="dropdown-item" href="#" onClick={CreateFamily}>Семью</a></li>
                          <li><a className="dropdown-item" href="#" onClick={OpenCreateDocumentModal}>Документ</a></li>
                          <li><a className="dropdown-item" href="#"onClick={OpenCreatePersonModal}>Персону</a></li>
                          <li><a className="dropdown-item" href="#"onClick={OpenCreateHouseModal}>Жилое помещение</a></li>
                          </ul>
                      </li>
                      <li className="nav-item">
                          <Link to="/" className="nav-link"> Главная </Link>
                      </li>
                      <li className="nav-item">
                          <Link to="/persons" className="nav-link"> Персоны </Link>
                      </li>
                      <li className="nav-item">
                          <Link to="/houses" className="nav-link"> Жилые помещения </Link>
                      </li>
                      <li className="nav-item">
                          <Link to="/documents" className="nav-link"> Документы </Link>
                      </li>
                  </ul>
              </div>
      </nav>
  )
}

export default App;
