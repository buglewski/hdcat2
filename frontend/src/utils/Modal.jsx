import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { AreYouSureModal } from './AreYouSureModal';
import { CreateClaimModal } from '../claim/CreateClaimModal';
import { CreateDocumentModal } from '../document/CreateDocumentModal';
import { CreateHouseModal } from '../house/CreateHouseModal';
import { CreatePersonModal } from '../person/CreatePersonModal';
import { SetRolesModal } from '../family/SetRolesModal';
function useModal() {
    const [show, setShow] = useState(false);
    const [CurrentModalComponent, SetCurrentModalComponent] = useState({name: ""})

    const handleClose = () => {
        setShow(false);
        SetCurrentModalComponent({name: ""});
    }

    return [()=>(
        <Modal show={show} size="lg" onHide={handleClose}>
            {
                CurrentModalComponent.name == "CreateDocumentModal" ?
                <CreateDocumentModal setShow={setShow} {...CurrentModalComponent}/> :
                CurrentModalComponent.name == "CreateHouseModal" ?
                <CreateHouseModal setShow={setShow}{...CurrentModalComponent}/> :
                CurrentModalComponent.name == "CreatePersonModal" ?
                <CreatePersonModal setShow={setShow}{...CurrentModalComponent}/> :
                CurrentModalComponent.name == "SetRolesModal" ?
                <SetRolesModal setShow={setShow}{...CurrentModalComponent}/> :
                CurrentModalComponent.name == "CreateClaimModal" ?
                <CreateClaimModal setShow={setShow}{...CurrentModalComponent}/> :
                CurrentModalComponent.name == "AreYouSureModal" ?
                <AreYouSureModal setShow={setShow}{...CurrentModalComponent}/> :
                <> Модальное окно не найдено </>
            }
        </Modal>
    ), SetCurrentModalComponent, setShow];
}

export default useModal;