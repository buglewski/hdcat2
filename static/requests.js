async function make_request(req, url = URL_ROOT) {
    const request = new Request(req);
    let response = await fetch(request);
    if (response.ok) {
      let json = await response.json();
      return json.content;
    } else {
      alert("Ошибка HTTP: " + response.status);
    }  
}

const upload_object = (data, address) => {
    let xhr = new XMLHttpRequest()
    xhr.open('POST', address)
    xhr.send(data)
    return new Promise((resolve, reject) =>
      xhr.onload = function() {
        if (xhr.status != 200) { // анализируем HTTP-статус ответа, если статус не 200, то произошла ошибка
          alert(`Ошибка ${xhr.status}: ${xhr.statusText}`); // Например, 404: Not Found
          reject()
        } else { // если всё прошло гладко, выводим результат
          resolve(JSON.parse(xhr.response))
        }
      }
    )
}

const send_document = (document, selectedFile) => {
    //console.log(selectedFile[0])
    const data = new FormData();
    data.append("document", JSON.stringify(document));
    if (selectedFile && selectedFile[0]){
        data.append("file", selectedFile[0])
    }
    return upload_object(data, "upload/document")
    
}

const send_person = (person) => {
    const data = new FormData();
    data.append("person", JSON.stringify(person));
    return upload_object(data, "upload/person")
}

const send_house = (house) => {
  const data = new FormData();
  data.append("house", JSON.stringify(house));
  return upload_object(data, "upload/house")
}

const send_person_document = (personDocument) => {
  const data = new FormData();
  data.append("person_document", JSON.stringify(personDocument));
  return upload_object(data, "upload/person_document")
}

const send_person_house = (personHouse) => {
  const data = new FormData();
  data.append("person_house", JSON.stringify(personHouse));
  return upload_object(data, "upload/person_house")
}

const send_family_person = (family_person) => {
  const data = new FormData();
  data.append("family_person", JSON.stringify(family_person));
  return upload_object(data, "upload/family_person")
}

const send_claim = (claim) => {
  const data = new FormData();
  data.append("claim", JSON.stringify(claim));
  return upload_object(data, "upload/claim")
}

const send_claim_document = (claim_document) => {
  const data = new FormData();
  data.append("claim_document", JSON.stringify(claim_document));
  return upload_object(data, "upload/claim_document")
}

const create_family = () => {
  const data = new FormData();
  data.append("family", JSON.stringify({typename: "t"}));
  return upload_object(data, "upload/family")
}