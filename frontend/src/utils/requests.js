import API from '../api_info'

class Requests {
  static async make_request(req, url = API.URL) {
      let response = await fetch(url + req);
      if (response.ok) {
        let json = await response.json();
        return json.content;
      } else {
        //alert("Ошибка HTTP: " + response.status);
        throw response
      }  
  }

  static upload_object = async (data, address) => {
    try {
      let response = await fetch(API.URL + address, {
        method: "POST",
        body: data
      })
      if (response.ok) {
        let json = response.json();
        return json;
      } else {
        throw ("Ошибка HTTP: " + response.status);
      }  
    } catch(error){
      alert("Error:" + error)
    }
  }

  static delete_object = async (address) => {
    console.log(API.URL + address)
    try {
      let response = await fetch(API.URL + address, {
        method: "DELETE",
      })
      if (response.ok) {
        let json = response.json();
        return json;
      } else {
        throw ("Ошибка HTTP: " + response.status);
      }  
    } catch(error){
      alert("Error:" + error)
    }
  }

  static upload_object_2 = async (data, address) => {
    return fetch(API.URL + address, {
      method: "POST",
      body: data
    })
    .then((response)=>{
      if (response.ok) {
        let json = response.json();
        console.log(json)
        return json;
      } else {
        alert("Ошибка HTTP: " + response.status);
      }  
    }, (reason)=>{
      alert("Ошибка фетчинга:" + reason)
    })
  }

  static send_document = (document, selectedFile) => {
      //console.log(selectedFile[0])
      const data = new FormData();
      data.append("document", JSON.stringify(document));
      if (selectedFile && selectedFile[0]){
          data.append("file", selectedFile[0])
      }
      return this.upload_object(data, "upload/document")
      
  }

  static send_person = (person) => {
      const data = new FormData();
      data.append("person", JSON.stringify(person));
      return this.upload_object(data, "upload/person")
  }

  static send_house = (house) => {
    const data = new FormData();
    data.append("house", JSON.stringify(house));
    return this.upload_object(data, "upload/house")
  }

  static send_person_document = (personDocument) => {
    const data = new FormData();
    data.append("person_document", JSON.stringify(personDocument));
    return this.upload_object(data, "upload/person_document")
  }

  static send_person_house = (personHouse) => {
    const data = new FormData();
    data.append("person_house", JSON.stringify(personHouse));
    return this.upload_object(data, "upload/person_house")
  }

  static send_family_person = (family_person) => {
    const data = new FormData();
    data.append("family_person", JSON.stringify(family_person));
    return this.upload_object(data, "upload/family_person")
  }

  static send_claim = (claim) => {
    const data = new FormData();
    data.append("claim", JSON.stringify(claim));
    return this.upload_object(data, "upload/claim")
  }

  static send_claim_document = (claim_document) => {
    const data = new FormData();
    data.append("claim_document", JSON.stringify(claim_document));
    return this.upload_object(data, "upload/claim_document")
  }

  static create_family = () => {
    const data = new FormData();
    data.append("family", JSON.stringify({typename: "t"}));
    return this.upload_object(data, "upload/family")
  }
}

export default Requests;
