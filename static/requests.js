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

  const send_document = (document, selectedFile) => {
    //console.log(selectedFile[0])
    const data = new FormData();
    data.append("document", JSON.stringify(document));
    if (selectedFile && selectedFile[0]){
        data.append("file", selectedFile[0])
    }
    let xhr = new XMLHttpRequest()
    xhr.open('POST', 'upload_document')
    const p = new Promise((resolve, reject)=>{ 
        return resolve(xhr.send(data));
    }).then((response) => {
        console.log("SUCCESS!")
    })
}