from sqlalchemy import create_engine
from models import *
from flask import Flask

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.drop_all()
    db.create_all()
    # doc = Document(typename="passport")
    # reg = House(region="Transvaal")
    # reg.statuses.append(HouseStatus(status="GOVNO!"))
    # reg.documents.append(Document(typename="MEOW"))
    # per = Person(lastname="Petrov", firstname="Petr", gender = "MALE", passport = doc, housereg = reg)
    # per.documents.append(doc)
    # per2 = Person(lastname="Petrova",firstname="Inga", gender = "FEMALE")
    # per3 = Person(lastname = "Petrov", firstname = "Andrey")
    # ph1 = PersonHouse()
    # ph1.house = reg
    # ph1.relation = "RELATION"
    # per.person_houses.append(ph1)
    # print(per.firstname, per.gender)

    # fam = Family(typename="gfffgfgf", 
    #              family_persons= [ FamilyPerson(person=per, role="father"), 
    #                               FamilyPerson(person=per2, role="mother"), 
    #                               FamilyPerson(person=per3, role="son") ]
    #             )
    # db.session.add(fam)
    # db.session.commit()
    
