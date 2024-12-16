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
    doc = Document(typename="passport")
    reg = House(region="Transvaal")
    reg.statuses.append(HouseStatus(status="GOVNO!"))
    reg.documents.append(Document(typename="MEOW"))
    per = Person(lastname="Petrov", firstname="Petr", gender = "MALE", passport = doc, housereg = reg)
    per2 = Person(lastname="Petrova",firstname="Inga", gender = "FEMALE")
    per3 = Person(lastname = "Petrov", firstname = "Andrey")
    ph1 = PersonHouse()
    ph1.house = reg
    ph1.relation = "RELATION"
    per.person_houses.append(ph1)
    per4 = Person()
    per4.lastname = "Petrov"
    per4.firstname = "Ivanko"
    per.spouse = per2
    per2.spouse = per
    per3.father = per
    per3.mother = per2
    per4.father = per
    per5 = Person(lastname = "Petsrova", firstname="Violett")
    per5.father_id = 1
    per5.mother_id = 2
    print(per.firstname, per.gender)
    print(per.children[0].firstname)

    fam = Family(typename="gfffgfgf", 
                 persons=[ per, per2, per3, per4, per5 ]
                )
    db.session.add(fam)
    db.session.commit()
    
