from flask import Flask, request, render_template, redirect
import selection

app = Flask(__name__)

def get_person_context(person_id : int, args : dict, flags : dict, connection : selection.Connection):
    #flags['person'] = 'edit_person'
    if flags['person'] == 'create_person': return {}
    person_context = {
        "person" : connection.select_persons(person_id=person_id)[0],
        "documents" : connection.select_documents(person_id=person_id),
        "document_types" : connection.select_document_type()
    }

    if "doc_action" in args:
        person_context["document_list"] = connection.select_documents()
        flags['document'] = args["doc_action"]
    if "edit_document" in args:
        flags['document'] = "create_document"
        if args["edit_document"] != '0':
            person_context["document_to_edit"] = connection.select_documents(document_id=args["edit_document"])[0]
            flags['document'] = "edit_document"
    return person_context

def args_to_request(args : dict):
    ans = ''
    for key, value in args.items():
        ans += f"{key}={value}&"
    return ans

@app.route("/", methods=['GET'])
def get_family_list():
    connection = selection.Connection()
    families = connection.select_family_list()
    return render_template("families.html", families=families)

@app.route("/families/<int:id>", methods=['GET'])
def get_family(id):
    connection = selection.Connection()
    args = request.args.to_dict()
    flags = {"family": "edit_family"}
    family_context = {
        'persons': connection.select_persons_of_family(family_id=id)
    }
    if "person_action" in args:
        if args["person_action"] == "add_person_to_family":
            family_context['all_persons'] = connection.select_persons()
        flags["person"] = args["person_action"]
    if "edit_person" in args:
        flags["person"] = "edit_person"
        family_context['person_context'] = get_person_context(args['edit_person'], args, flags, connection)
    print(flags)
    return render_template("family_edit.html", flags = flags, family_context=family_context)

@app.route("/persons", methods=['GET'])
def read_item():
    connection = selection.Connection()
    persons = connection.select_persons()
    return render_template("persons.html", persons=persons)

@app.route("/documents", methods=['GET'])
def get_documents():
    connection = selection.Connection()
    documents = connection.select_documents()
    return render_template("documents.html", documents=documents)

@app.route("/documents/<int:id>", methods=['GET'])
def get_document(id):
    connection = selection.Connection()
    document = connection.select_documents(person_id=0, document_id=id)
    document_types = connection.select_document_type()
    return render_template("document_edit.html", flag = "edit_document", document=document[0], document_types=document_types)

@app.route("/documents/0", methods=['GET'])
def create_document():
    connection = selection.Connection()
    document_types = connection.select_document_type()
    return render_template("document_edit.html", flag = "create_document", document_types=document_types)


@app.route("/persons/<int:id>", methods=['GET'])
def get_person(id : int):
    connection = selection.Connection()
    args = request.args.to_dict()
    flags = {"person": "edit_person" if id > 0 else "create_person"}
    person_context = get_person_context(id, args, flags, connection)
    return render_template("person_edit.html", flags=flags, person_context=person_context)

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
        if "edit_family" in self.data:
            return self.data["edit_family"]
        if "edit_person" in self.data:
            return self.data["edit_person"]
        if "edit_document" in self.data:
            return self.data["edit_document"]
        raise "ERROR OF HANDLER"
    
    def add_person_to_family(self):
        self.connection.insert_family_person(self.data["edit_family"], self.data["add_person_to_family"])
        self.args.pop('person_action')

    def create_person(self):
        self.data['person_id'] = self.connection.create_person(self.data)
        if "edit_family" in self.data:
            self.connection.insert_family_person(self.data["edit_family"], self.data['person_id'])
            self.args.pop('person_action')
            self.args["edit_person"] = f"{self.data['person_id']}"

    def edit_person(self):
        self.connection.update_person(self.data["edit_person"], self.data)

    def delete_person_from_family(self):
        self.connection.delete_family_person(self.data["edit_family"], self.data["delete_person_from_family"])

    def add_document(self):
        self.connection.add_person_document(self.data["edit_person"], self.data["add_document"])
        self.args.pop('doc_action')

    def delete_document_from_person(self):
        self.connection.delete_person_document(self.data["edit_person"], self.data["delete_document_from_person"])

    def set_dul(self):
        self.connection.update_dul(self.data["edit_person"], self.data["set_dul"])

    def create_document(self):
        self.data["edit_document"] = self.connection.add_document(self.data)
        if "edit_person" in self.data:
            self.connection.add_person_document(self.data["edit_person"], self.data["edit_document"])
            self.args.pop('edit_document')

    def edit_document(self):
        self.connection.update_document(self.data["edit_document"], self.data)


def post_handler(id : int, single : str, mult: str):
    connection = selection.Connection()
    args = request.args.to_dict()
    data = request.form.to_dict()
    data.update(args)
    data[single] = id
    print(args)
    print(data)
    id = PostHandler(data, args, connection).handle(data['action'])
    return redirect(f"/{mult}/{id}?{args_to_request(args)}")

@app.route("/families/<int:id>", methods=['POST'])
def edit_family(id):
    return post_handler(id, "families", "edit_family")

@app.route("/persons/<int:id>", methods=['POST'])
def edit_person(id):
    return post_handler(id, "persons","edit_person")

@app.route("/documents/<int:id>", methods=['POST'])
def edit_document(id):
    return post_handler(id, "documents", "edit_document")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1453)