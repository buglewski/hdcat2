from docxtpl import DocxTemplate
from flask import Flask, Request, request, render_template, redirect, send_file
from flask_json import FlaskJSON, JsonError, json_response, as_json
from flask_login import current_user, login_user
from sqlalchemy import and_, or_, not_
from werkzeug.datastructures import ImmutableMultiDict, FileStorage
import os

from datetime import datetime, date

import json

from config import *
from models import *
from serializition import *

FlaskJSON(app)

db.init_app(app)

@login_manager.user_loader
def load_user(username):
    return db.session.query(User).filter(User.username == username).first()

def upload_document(document_id, files : ImmutableMultiDict[str, FileStorage]):
    if 'file' not in files or files['file'].filename == '':
        return None
    file = files['file']
    if file:
        filename = str(document_id) + '_' + file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return filename
    return None

def delete_file(filename):
    if not filename: return
    try:
        os.remove(app.config['UPLOAD_FOLDER'] + '/' + filename)
    except: pass

@app.route('/download/<filename>')
@cross_origin()
def download(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename), download_name=filename, as_attachment=True )

@app.route('/getclaimfile/<int:claim_id>')
@cross_origin()
def create_docx(claim_id):
    claim = db.session.query(Claim).filter(Claim.id == claim_id).first()
    template = SETTINGS['claims'][claim.typename]['template']
    doc = DocxTemplate(template)
    doc.render({"claim" : claim})
    doc.save(CLAIM_TEMPORARY_FILE)
    filename = SETTINGS['claims'][claim.typename]['name'] + '_' + datetime.now().strftime("%Y-%m-%dT%H:%M") + '.docx'
    return send_file(CLAIM_TEMPORARY_FILE, download_name=filename, as_attachment=True )

def get_object_class(obj_name : str) -> type:
    object_classes : dict[str, type] = {
        "claim": Claim,
        "document": Document,
        "person": Person,
        "family": Family,
        "house": House,
        "person_document" : PersonDocument,
        "family_person" : FamilyPerson,
        "person_house" : PersonHouse
    }
    return object_classes[obj_name]

def get_schema(obj_name : str):
    object_schemas = {
        "document": DocumentSchema(),
        "house" : HouseSchema(),
        "person": PersonSchema(),
        "family": FamilySchema()
    }
    return object_schemas[obj_name]

@app.route("/", methods=['GET'])
@cross_origin()
def root():
    return render_template("index.html")
    #return app.send_static_file('index.html')

@app.route("/get_settings", methods=['GET'])
@cross_origin()
def get_settings():
    return json_response(content=SETTINGS)

@app.route("/get_documents", methods=['GET'])
@cross_origin()
def get_documents():
    documents = db.session.query(Document)
    documents = documents.order_by(Document.id.desc())
    query = request.args
    if typename:=query.get("typename"):
        documents = documents.filter(Document.typename.ilike('%' + typename + '%'))
    if title:=query.get("title"):
        documents = documents.filter(Document.title.ilike('%' + title + '%'))
    if series:=query.get("series"):
        documents = documents.filter(Document.series.ilike('%' + series + '%'))
    if number:=query.get("number"):
        documents = documents.filter(Document.number.ilike('%' + number + '%'))
    if issuer:=query.get("issuer"):
        documents = documents.filter(Document.issuer.ilike('%' + issuer + '%'))
    if limit:=query.get('limit'):
        documents = documents.limit(limit)
    documents=documents.all()
    documents_schema = DocumentLightSchema(many=True)
    content = documents_schema.jsonify(documents).get_json()
    return json_response(content=content)


@app.route("/delete/<obj_name>/<int:id>", methods=['DELETE'])
@cross_origin()
def delete_object(obj_name : str, id : int):
    ObjectClass = get_object_class(obj_name)
    obj = db.session.query(ObjectClass).filter(ObjectClass.id == id).first()
    if obj is None:
        return json_response(status_=404)
    db.session.delete(obj)
    db.session.commit()
    return json_response()

@app.route("/get/<obj_name>/<int:id>", methods=['GET'])
@cross_origin()
def get_document(obj_name : str, id : int):
    ObjectClass = get_object_class(obj_name)
    object_schema = get_schema(obj_name)
    obj = db.session.query(ObjectClass).filter(ObjectClass.id == id).first()
    if obj is None:
        return json_response(status_=404)
    content = object_schema.jsonify(obj).get_json()
    return json_response(content=content)

@app.route("/get_families", methods=['GET'])
@cross_origin()
def get_families():
    families = db.session.query(Family)

    query = request.args
    if search_text:=query.get("text"):
        search_words = search_text.split()
        families = families.join(FamilyPerson).join(Person)
        
        for word in search_words:
            f = '%' + word + '%'
            families = families.filter(or_(Person.lastname.ilike(f), 
                                         Person.firstname.ilike(f),
                                         Person.secondname.ilike(f)))

    families = families.all()
    family_schema = FamilyLightSchema(many=True)
    content = family_schema.jsonify(families).get_json()
    return json_response(content=content)

@app.route("/get_houses", methods=['GET'])
@cross_origin()
def get_houses():
    houses = db.session.query(House)
    houses = houses.order_by(House.id.desc())
    query = request.args
    if street:=query.get("street"):
        houses = houses.filter(House.street.ilike('%' + street + '%'))
    if house:=query.get("house"):
        houses = houses.filter(House.house.ilike('%' + house + '%'))
    if flat:=query.get("flat"):
        houses = houses.filter(House.flat.ilike('%' + flat + '%'))
    if limit:=query.get('limit'):
        houses = houses.limit(limit)
    houses = houses.all()
    house_schema = HouseLightSchema(many=True)
    content = house_schema.jsonify(houses).get_json()
    return json_response(content=content)

def meow(Obj, params, filts):
    ans = False
    for param in params:
        subans = False
        for filt in filts:
            subans = or_(subans, getattr(Obj, param).like(filt))
        ans = or_(ans, subans)
    return ans

@app.route("/get_persons", methods=['GET'])
@cross_origin()
def get_persons():
    persons = db.session.query(Person)
    persons = persons.order_by(Person.id.desc())

    query = request.args
    if search_text:=query.get("text"):
        search_words = search_text.split()
        
        for word in search_words:
            f = '%' + word + '%'
            persons = persons.filter(or_(Person.lastname.ilike(f), 
                                         Person.firstname.ilike(f),
                                         Person.secondname.ilike(f)))
            
    
    if lastname:=query.get("lastname"):
        persons = persons.filter(Person.lastname.ilike('%' + lastname + '%'))
    if firstname:=query.get("firstname"):
        persons = persons.filter(Person.firstname.ilike('%' + firstname + '%'))
    if secondname:=query.get("secondname"):
        persons = persons.filter(Person.secondname.ilike('%' + secondname + '%'))
    if snils:=query.get("snils"):
        persons = persons.filter(Person.snils.ilike('%' + snils + '%'))



    if limit:=query.get('limit'):
        persons = persons.limit(limit)
    
    persons = persons.all()
    person_schema = PersonLightSchema(many=True)
    content = person_schema.jsonify(persons).get_json()
    return json_response(content=content)

@app.route("/upload/<obj_name>", methods=['POST'])
@cross_origin()
def upload_object(obj_name : str):
    #print(request.files)
    #print(request.form)
    #print(request.data)
    data = json.loads(request.form[obj_name])
    ObjectClass = get_object_class(obj_name)
    content = {}
    if "id" in data and (obj := db.session.query(ObjectClass).filter(ObjectClass.id == data['id']).first()):
        content["result"] = "edited"
    elif ("id" not in data and obj_name == "house"
          and (obj := db.session.query(ObjectClass).filter_by(**House.to_addr(data)).first())):
        content["result"] = "edited"
    else:
        obj = ObjectClass()
        db.session.add(obj)
        content["result"] = "created"
    obj.update(**data)    

    if obj_name == "document":
        filename = upload_document(obj.id, request.files)
        if filename:
            delete_file(obj.file)
            obj.file = filename

    db.session.commit()

    content["id"] = obj.id

    return json_response(content=content)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1453)