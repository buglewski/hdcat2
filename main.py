from flask import Flask, request, render_template, redirect
import selection

app = Flask(__name__)

class GetHandler:
    def get_document_context(self, document_id : int, args : dict, flags : dict, connection : selection.Connection):
        if flags['document'] == 'create_document': return { "document_types" : connection.select_document_type() }
        document_context = {
            "document": connection.select_documents(document_id)[0],
            "document_types" : connection.select_document_type(),
            "persons_of_document": connection.select_persons_of_document(document_id)
        }
        return document_context

    def get_family_context(self, family_id : int, args : dict, flags : dict, connection : selection.Connection):
        if flags['family'] == 'create_family': return { 'family_types' : connection.select_family_types() }
        family_context = {
            'persons': connection.select_persons_of_family(family_id=family_id),
            'family': connection.select_families(family_id=family_id)[0],
            'family_types' : connection.select_family_types()
        }
        if "add_person_to_family" in args:
            family_context['all_persons'] = connection.select_persons()
            flags["person"] = "add_person_to_family"
        if "create_person" in args:
            flags["person"] = "create_person"
        if "edit_person" in args:
            flags["person"] = "edit_person"
            family_context['person_context'] = self.get_person_context(args['edit_person'], args, flags, connection)
        print(family_context)
        return family_context

    def get_person_context(self, person_id : int, args : dict, flags : dict, connection : selection.Connection):
        if flags['person'] == 'create_person': return { "document_types": connection.select_document_type() }
        person_context = {
            "person" : connection.select_persons(person_id=person_id)[0],
            "documents" : connection.select_documents_of_person(person_id=person_id),
            "linked_families" : connection.select_families_with_persons(person_id=person_id),
            "document_types": connection.select_document_type()
        }
        if "add_document" in args:
            person_context["all_document"] = connection.select_documents()
            flags['document'] = "add_document"
        if "create_document" in args:
            flags['document'] = "create_document"
        if "edit_document" in args:
            flags['document'] = "edit_document"
            person_context["document_to_edit"] = connection.select_documents(args["edit_document"])[0]
        return person_context

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
            "linked_families" : connection.select_families_with_persons(person_id=person_id),
            "document_types": connection.select_document_type()
        }
    elif "add_person_to_family" in args:
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
        self.args.pop(request)
    
    def add_person_to_family(self):
        self.connection.add_family_person(self.args["edit_family"], self.args["add_person_to_family"])

    def create_family(self):
        self.args["edit_family"] = self.connection.create_family(self.data)

    def create_person(self):
        self.args['edit_person'] = self.connection.create_person(self.data)
        if "edit_family" in self.args:
            self.connection.add_family_person(self.args["edit_family"], self.args['edit_person'], self.data['role'])
    
    def edit_family(self):
        self.connection.update_family(self.args["edit_family"], self.data)

    def edit_person(self):
        self.connection.update_person(self.args["edit_person"], self.data)
        if "edit_family" in self.args:
            self.connection.update_role(self.args["edit_family"], self.args['edit_person'], self.data['role'])

    def delete_person_from_family(self):
        self.connection.delete_family_person(self.args["edit_family"], self.args["delete_person_from_family"])

    def add_document(self):
        self.connection.add_person_document(self.args["edit_person"], self.args["add_document"])

    def delete_document_from_person(self):
        self.connection.delete_person_document(self.args["edit_person"], self.args["delete_document_from_person"])

    def set_dul(self):
        self.connection.update_dul(self.args["edit_person"], self.args["set_dul"])

    def create_document(self):
        self.args["edit_document"] = self.connection.create_document(self.data)
        if "edit_person" in self.args:
            self.connection.add_person_document(self.args["edit_person"], self.args["edit_document"])

    def edit_document(self):
        self.connection.update_document(self.args["edit_document"], self.data)


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