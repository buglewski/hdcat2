from flask import Flask, request, render_template, redirect
import selection

app = Flask(__name__)

def args_to_request(args : dict):
    ans = ''
    for key, value in args.items():
        ans += f"{key}={value}&"
    return ans

@app.route("/documents", methods=['GET'])
def get_documents():
    connection = selection.Connection()
    documents = connection.select_documents()
    print(documents)
    return render_template("documents.html", documents=documents)

@app.route("/", methods=['GET'])
def get_families():
    connection = selection.Connection()
    families = connection.select_families_with_persons()
    #print(families)
    return render_template("families.html", families=families)

@app.route("/houses", methods=['GET'])
def get_houses():
    connection = selection.Connection()
    houses = connection.select_houses_expand()
    return render_template("houses.html", houses=houses)

@app.route("/persons", methods=['GET'])
def get_persons():
    connection = selection.Connection()
    persons = connection.select_persons()
    return render_template("persons.html", persons=persons)

@app.route("/editor", methods=['GET'])
def editor():
    connection = selection.Connection()
    args = request.args
    context = {}
    print(args)
    if 'create_family' in args: 
        context['family'] = { 'family_types' : connection.select_family_types() }
    elif 'edit_family' in args: 
        family_id = int(args["edit_family"])
        print("HERE!")
        context['family'] = {
            'persons': connection.select_persons_of_family(family_id=family_id),
            'family': connection.select_families(family_id=family_id)[family_id],
            'family_types' : connection.select_family_types()
        }
    else: context['family'] = {}

    if "create_person" in args: 
        context['person'] = {}
    elif "edit_person" in args:
        person_id = int(args["edit_person"])
        context['person'] = {
            "person" : connection.select_persons(person_id=person_id)[person_id],
            "documents" : connection.select_documents_of_person(person_id=person_id),
            "houses": connection.select_houses_of_person(person_id),
            'house_relation_types': connection.select_person_house_relation_types(),
            "linked_families" : connection.select_families_with_persons(person_id=person_id),
            "document_types": connection.select_document_type()
        }
    elif "add_person_to_family" in args or ("add_person_house_relation" in args and "edit_house" in args):
        context['person'] = { 
            "all_persons": connection.select_persons()  
        }
    else: context['person'] = {}

    if 'create_house' in args:
        context['house'] = {}
    elif 'edit_house' in args:
        house_id = int(args['edit_house'])
        context['house'] = {
            'house': connection.select_houses(house_id)[house_id],
            'statuses': connection.select_house_statuses(house_id),
            'persons': connection.select_persons_of_house(house_id),
            'documents': connection.select_documents_of_house(house_id),
            'status_types': connection.select_house_status_types(),
            'person_relation_types': connection.select_person_house_relation_types()
        }
    elif "add_house_to_document" in args or ("add_person_house_relation" in args and "edit_person" in args):
        context['house'] = { 
            "all_houses": connection.select_houses()  
        }
    else: context['house'] = {}

    if 'create_document' in args: 
        context['document'] = { "document_types" : connection.select_document_type() }
    elif 'edit_document' in args:
        document_id = int(args['edit_document'])
        context['document'] = {
            "document": connection.select_documents(document_id)[document_id],
            "document_types" : connection.select_document_type(),
            "persons_of_document": connection.select_persons_of_document(document_id)
        }
    elif "add_document" in args:
        context['document'] = { 
            "all_documents": connection.select_documents()  
        }
    else: context['document'] = { }

    #print(args)
    #print(context)
    return render_template("editor.html", args = args, context=context)


"""
POST LOGIC
"""

class PostHandler:
    def __init__(self, data: dict, args : dict = {}, connection : selection.Connection = selection.Connection()):
        self.data = data
        self.connection = connection
        self.args = args
    def handle(self, request : str):
        getattr(self, request)()
        edits = ['edit_document', 'edit_family', 'edit_house', 'edit_person']
        if request not in edits: self.args.pop(request)
    
    def add_document(self):
        if "edit_person" in self.args:
            self.connection.add_person_document(self.args["edit_person"], self.args["add_document"])
        if "edit_house" in self.args:
            self.connection.add_house_document(self.args["edit_house"], self.args["add_document"])

    def add_person_house_relation(self):
        if 'edit_house' in self.args:
            self.connection.add_person_house(self.args['add_person_house_relation'], self.args['edit_house'])
        if 'edit_person' in self.args:
            self.connection.add_person_house(self.args['edit_person'], self.args['add_person_house_relation'])

    def add_person_to_family(self):
        self.connection.add_family_person(self.args["edit_family"], self.args["add_person_to_family"])

    def add_status_of_house(self):
        self.connection.create_house_status(self.args['edit_house'], self.data)

    def create_family(self):
        self.args["edit_family"] = self.connection.create_family(self.data)

    def create_house(self):
        house_id = self.connection.create_house(self.data)
        if 'edit_person' in self.args:
            self.connection.add_person_house(self.args['edit_person'], house_id)
        else:
            self.args["edit_house"] = house_id

    def create_person(self):
        self.args['edit_person'] = self.connection.create_person(self.data)
        if "edit_family" in self.args:
            self.connection.add_family_person(self.args["edit_family"], self.args['edit_person'], self.data['role'])
    
    def edit_document(self):
        self.connection.update_document(self.args["edit_document"], self.data)
    
    def edit_family(self):
        self.connection.update_family(self.args["edit_family"], self.data)

    def edit_house(self):
        self.connection.update_house(self.args["edit_house"], self.data)

    def edit_person(self):
        self.connection.update_person(self.args["edit_person"], self.data)
        if "edit_family" in self.args:
            self.connection.update_role(self.args["edit_family"], self.args['edit_person'], self.data['role'])

    def edit_person_house_relation(self):
        self.connection.update_person_house_relation(self.args["edit_person_house_relation"], self.data)
    
    def edit_status_of_house(self):
        self.connection.update_house_status(self.args["edit_status_of_house"], self.data)

    def delete_person_from_family(self):
        self.connection.delete_family_person(self.args["edit_family"], self.args["delete_person_from_family"])

    def delete_document_from_person(self):
        self.connection.delete_person_document(self.args["edit_person"], self.args["delete_document_from_person"])

    def delete_document_from_house(self):
        self.connection.delete_house_document(self.args["edit_house"], self.args["delete_document_from_house"])

    def set_dul(self):
        self.connection.update_dul(self.args["edit_person"], self.args["set_dul"])

    def set_reg(self):
        self.connection.update_reg(self.args["edit_person"], self.args["set_reg"])
    
    def set_fact(self):
        self.connection.update_fact(self.args["edit_person"], self.args["set_fact"])

    def create_document(self):
        self.args["edit_document"] = self.connection.create_document(self.data)
        if "edit_person" in self.args:
            self.connection.add_person_document(self.args["edit_person"], self.args["edit_document"])
        if "edit_house" in self.args:
            self.connection.add_house_document(self.args["edit_house"], self.args["edit_document"])

    


@app.route("/editor", methods=['POST'])
def post_editor():
    connection = selection.Connection()
    args = request.args.to_dict()
    data = request.form.to_dict()
    print("POST: ", request.args)
    print("POST: ", request.form)
    PostHandler(data, args, connection).handle(data['action'])
    return redirect(f"/editor?{args_to_request(args)}")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1453)