from docxtpl import DocxTemplate
from flask import Flask, Request, request, render_template, redirect, send_file
from flask_json import FlaskJSON, JsonError, json_response, as_json
from werkzeug.datastructures import ImmutableMultiDict, FileStorage
from werkzeug.security import generate_password_hash, check_password_hash
import os

from datetime import datetime, date

import json
import selection

from config import *
from src.models import *
from src.serializition import *

FlaskJSON(app)

db.init_app(app)

def upload_document(document_id, files : ImmutableMultiDict[str, FileStorage]):
    if 'file' not in files or files['file'].filename == '':
        return None
    file = files['file']
    if file:
        filename = str(document_id)+'.'+file.filename.split('.')[1]
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return filename
    return None

@app.route('/download/<filename>')
def download(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename), download_name=filename, as_attachment=True )

@app.route('/docx/<int:family_id>/<int:claim_id>')
def create_docx(family_id, claim_id):
    connection = selection.Connection()
    context = {
        'claim': connection.select_claims(claim_id=claim_id)[claim_id],
        'persons': connection.select_persons_of_family(family_id=family_id),
        'family': connection.select_families(family_id=family_id)[family_id],
    }
    context['claim']['claim.date_time'] = datetime.strptime(context['claim']['claim.date_time'], "%Y-%m-%dT%H:%M")
    for person in context['persons'].values():
        person['person.birthdate'] = datetime.strptime(person['person.birthdate'], "%Y-%m-%d")
        person['passport.issue_date'] = datetime.strptime(person['passport.issue_date'], "%Y-%m-%d")

    context['claimer'] = context['persons'][context['claim']['claim.person_id']]
    template = SETTINGS['claims'][str(context['claim']['claim.type_id'])]['template']
    doc = DocxTemplate(template)
    doc.render(context)
    doc.save(CLAIM_TEMPORARY_FILE)
    filename = context['claim']['claim_type.name'] + '_' + str(context['claim']['claim.date_time']) + '.docx'
    return send_file(CLAIM_TEMPORARY_FILE, download_name=filename, as_attachment=True )

def args_to_request(args : dict):
    ans = ''
    for key, value in args.items():
        ans += f"{key}={value}&"
    return ans

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
def root():
    return render_template("index.html")

@app.route("/get_settings", methods=['GET'])
def get_settings():
    return json_response(content=SETTINGS)

@app.route("/get_documents", methods=['GET'])
def get_documents():
    documents = db.session.query(Document).all()
    documents_schema = DocumentLightSchema(many=True)
    content = documents_schema.jsonify(documents).get_json()
    return json_response(content=content)


@app.route("/get/<obj_name>/<int:id>", methods=['GET'])
def get_document(obj_name : str, id : int):
    ObjectClass = get_object_class(obj_name)
    object_schema = get_schema(obj_name)
    obj = db.session.query(ObjectClass).filter(ObjectClass.id == id).first()
    if obj is None:
        return json_response(status=404)
    content = object_schema.jsonify(obj).get_json()
    return json_response(content=content)

@app.route("/get_families", methods=['GET'])
def get_families():
    families = db.session.query(Family).all()
    family_schema = FamilyLightSchema(many=True)
    content = family_schema.jsonify(families).get_json()
    return json_response(content=content)

@app.route("/get_houses", methods=['GET'])
def get_houses():
    houses = db.session.query(House).all()
    house_schema = HouseLightSchema(many=True)
    content = house_schema.jsonify(houses).get_json()
    return json_response(content=content)

@app.route("/get_persons", methods=['GET'])
def get_persons():
    persons = db.session.query(Person).all()
    person_schema = PersonLightSchema(many=True)
    content = person_schema.jsonify(persons).get_json()
    return json_response(content=content)

@app.route("/upload/<obj_name>", methods=['POST'])
def upload_document(obj_name : str):
    #print(request.data)
    #print(request.form)
    data = json.loads(request.form[obj_name])
    data['issue_date'] = datetime.strptime(data['issue_date'], '%Y-%m-%d') if 'issue_date' in data and data['issue_date'] else None
    data['birthday'] = datetime.strptime(data['birthday'], '%Y-%m-%d') if 'birthday' in data and data['birthday'] else None

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
    db.session.commit()
    content["id"] = obj.id
    return json_response(content=content)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1453)