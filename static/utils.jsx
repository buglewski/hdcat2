const PersonFullName = function(props){
    return (
        <div> 
        <a href={"persons/" + props.person.id}> {props.person.lastname} {props.person.firstname} {props.person.secondname} </a>
        </div>
    )
}

const FamilyClaimTable = function(props){
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
                    <th scope="col"> {index+1} </th>
                    <td>
                        {fam.persons.map((person, index)=>(
                            <PersonFullName person={person}/>
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
                    <td><PersonFullName person={person}/></td>
                    <td>{person.birthdate}</td>
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

const Nothing = function(props){
    return (
        <div> Nothing </div>
    )
}