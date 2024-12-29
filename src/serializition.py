from flask_marshmallow import Marshmallow
from config import *
from src.models import *

ma = Marshmallow(app)

class MetaBase:
    include_fk = True
    include_relationships = False
    load_instance = True

class ClaimLightSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = Claim

class DocumentLightSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = Document

class HouseLightSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = House
        include_fk = True

class PersonLightSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = Person
    passport = ma.Nested(DocumentLightSchema)
    housereg = ma.Nested(HouseLightSchema)
    housefact = ma.Nested(HouseLightSchema)
    snils = ma.Nested(DocumentLightSchema)

class FamilyPersonLightSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = FamilyPerson
    person = ma.Nested(PersonLightSchema)

class FamilyLightSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = House
    family_persons = ma.Nested(FamilyPersonLightSchema, many=True)
    claims = ma.Nested(ClaimLightSchema, many=True)

class FamilyPersonSchema(FamilyPersonLightSchema):
    family = ma.Nested(FamilyLightSchema)

class PersonHouseSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = PersonHouse
    person = ma.Nested(PersonLightSchema)
    house = ma.Nested(HouseLightSchema)

class HouseStatusSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = HouseStatus


class DocumentSchema(DocumentLightSchema):
    persons = ma.Nested(PersonLightSchema, many=True)
    houses = ma.Nested(HouseLightSchema, many=True)

class ClaimSchema(ClaimLightSchema):
    family = ma.Nested(FamilyLightSchema)
    documents = ma.Nested(DocumentLightSchema, many=True)

class HouseSchema(HouseLightSchema):
    person_houses = ma.Nested(PersonHouseSchema, many=True)
    statuses = ma.Nested(HouseStatusSchema, many=True)
    documents = ma.Nested(DocumentLightSchema, many=True)

class PersonSchema(PersonLightSchema):
    mother = ma.Nested(PersonLightSchema)
    father = ma.Nested(PersonLightSchema)
    spouse = ma.Nested(PersonLightSchema)
    documents = ma.Nested(DocumentLightSchema, many=True)
    person_houses = ma.Nested(PersonHouseSchema, many=True)
    family_persons = ma.Nested(FamilyPersonSchema, many=True)

class FamilyPersonBigSchema(FamilyPersonLightSchema):
    person = ma.Nested(PersonSchema)

class FamilySchema(FamilyLightSchema):
    family_persons = ma.Nested(FamilyPersonBigSchema, many=True)
    claims = ma.Nested(ClaimSchema, many=True)
