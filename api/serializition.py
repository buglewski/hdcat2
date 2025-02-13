from flask_marshmallow import Marshmallow
from api.config import *
from models import *

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

class FamilyPersonLightSchema(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = FamilyPerson
    person = ma.Nested(PersonLightSchema)

class FamilyLightSchemaWithoutClaims(ma.SQLAlchemyAutoSchema):
    class Meta(MetaBase):
        model = Family
    family_persons = ma.Nested(FamilyPersonLightSchema, many=True)

class FamilyLightSchema(FamilyLightSchemaWithoutClaims):
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

class PersonSchemaWithoutFamily(PersonLightSchema):
    documents = ma.Nested(DocumentLightSchema, many=True)
    person_houses = ma.Nested(PersonHouseSchema, many=True)

class PersonSchema(PersonSchemaWithoutFamily):
    family_persons = ma.Nested(FamilyPersonSchema, many=True)

class FamilyPersonBigSchema(FamilyPersonLightSchema):
    person = ma.Nested(PersonSchema)

class FamilyPersonSchemaLighter(FamilyPersonLightSchema):
    person = ma.Nested(PersonSchemaWithoutFamily)

class FamilySchemaWithoutClaims(FamilyLightSchemaWithoutClaims):
    family_persons = ma.Nested(FamilyPersonSchemaLighter, many=True)

class FamilySchema(FamilySchemaWithoutClaims):
    family_persons = ma.Nested(FamilyPersonBigSchema, many=True)
    claims = ma.Nested(ClaimSchema, many=True)

class ClaimBigSchema(ClaimLightSchema):
    claimer = ma.Nested(PersonSchemaWithoutFamily)
    family = ma.Nested(FamilySchemaWithoutClaims)
    documents = ma.Nested(DocumentLightSchema, many=True)