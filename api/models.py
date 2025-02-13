from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timezone
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from typing import List
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    username: Mapped[str] = mapped_column(String(255), primary_key=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    lastname: Mapped[str] = mapped_column(String(255))
    firstname: Mapped[str] = mapped_column(String(255))
    secondname: Mapped[str] = mapped_column(String(255), nullable=True)
    birthday: Mapped[date] = mapped_column(Date, default=date.today)
    position: Mapped[str] = mapped_column(String(255), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)

    def get_id(self):
        return self.username

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

class BaseNode(db.Model):
    __abstract__ = True
    actual: Mapped[bool] = mapped_column(Boolean, default=True)
    created_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    created_by : Mapped[str] = mapped_column(String(255), ForeignKey(User.username), nullable=True)
    updated_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)
    updated_by : Mapped[str] = mapped_column(String(255), ForeignKey(User.username), nullable=True)
    comment: Mapped[str] = mapped_column(String(1023), nullable=True)


class Document(BaseNode):
    __tablename__ = 'document'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    typename: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255), nullable=True)
    series: Mapped[str] = mapped_column(String(255), nullable=True)
    number: Mapped[str] = mapped_column(String(255), nullable=True)
    issuer: Mapped[str] = mapped_column(String(255), nullable=True)
    issue_date: Mapped[date] = mapped_column(Date, default=date.today)
    file: Mapped[str] = mapped_column(String(255), nullable=True)

    persons : Mapped[List["Person"]] = relationship(secondary="person_document", back_populates="documents")
    claims : Mapped[List["Claim"]] = relationship(secondary="claim_document", back_populates="documents")
    houses : Mapped[List["House"]] = relationship(secondary="house_document", back_populates="documents")

    def update(self, **kwargs):
        try:
            self.issue_date = datetime.strptime(kwargs['issue_date'], '%Y-%m-%d')
        except: pass
        self.typename = kwargs['typename']
        self.title = kwargs.get('title')
        self.series = kwargs.get('series')
        self.number = kwargs.get('number')
        self.issuer = kwargs.get('issuer')
        self.comment = kwargs.get('comment')

class Family(BaseNode):
    __tablename__ = 'family'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    typename: Mapped[str] = mapped_column(String(255))

    claims : Mapped[List["Claim"]] = relationship(back_populates='family', cascade="all, delete")
    family_persons : Mapped[List["FamilyPerson"]] = relationship(back_populates='family', cascade="all, delete")

    def update(self, **kwargs):
        self.typename = kwargs.get('typename') if kwargs.get('typename') else self.typename

class House(BaseNode):
    __tablename__ = 'house'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    region: Mapped[str] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(255), nullable=True)
    prefix: Mapped[str] = mapped_column(String(63), nullable=True)
    street: Mapped[str] = mapped_column(String(255), nullable=True)
    house: Mapped[str] = mapped_column(String(63), nullable=True)
    flat: Mapped[str] = mapped_column(String(63), nullable=True)
    area: Mapped[float] = mapped_column(Float, nullable=True)

    documents : Mapped[List["Document"]] = relationship(secondary="house_document", back_populates='houses')
    person_houses : Mapped[List["PersonHouse"]] = relationship(back_populates='house', cascade="all, delete")
    statuses : Mapped[List["HouseStatus"]] = relationship(cascade="all, delete")

    @property
    def address(self):
        return ' '.join([self.region + ',', self.city +',', self.prefix, self.street, self.house, '-' + self.flat if self.flat else ''])
        
    @staticmethod
    def to_addr(kwargs):
        ans = {
            'region' : kwargs.get('region'),
            'city' : kwargs.get('city'),
            'prefix' : kwargs.get('prefix'),
            'street' : kwargs.get('street'),
            'house' : kwargs.get('house'),
            'flat' : kwargs.get('flat')
        }
        print(ans)
        return ans

    def update(self, **kwargs):
        self.region = kwargs.get('region') if kwargs.get('region') else self.region
        self.city = kwargs.get('city') if kwargs.get('city') else self.city
        self.prefix = kwargs.get('prefix') if kwargs.get('prefix') else self.prefix
        self.street = kwargs.get('street') if kwargs.get('street') else self.street
        self.house = kwargs.get('house') if kwargs.get('house') else self.house
        self.flat = kwargs.get('flat') if kwargs.get('flat') else self.flat
        self.area = float(kwargs.get('area')) if kwargs.get('area') else self.comment
        
        


class Person(BaseNode):
    __tablename__ = 'person'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lastname: Mapped[str] = mapped_column(String(255))
    firstname: Mapped[str] = mapped_column(String(255))
    secondname: Mapped[str] = mapped_column(String(255), nullable=True)
    gender : Mapped[str] = mapped_column(String(15), default="MALE")
    birthday: Mapped[date] = mapped_column(Date, nullable=True)
    phone: Mapped[str] = mapped_column(String(255), nullable=True)
    passport_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id), nullable=True)
    regaddr_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id), nullable=True)
    factaddr_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id), nullable=True)
    snils : Mapped[str] = mapped_column(String, nullable=True)
    passport : Mapped[Document] = relationship(foreign_keys=[passport_id])
    housereg : Mapped[House] = relationship(foreign_keys=[regaddr_id])
    housefact : Mapped[House] = relationship(foreign_keys=[factaddr_id])

    documents : Mapped[List[Document]] = relationship(secondary="person_document", back_populates='persons')
    family_persons : Mapped[List["FamilyPerson"]] = relationship(back_populates='person')
    person_houses : Mapped[List["PersonHouse"]] = relationship(back_populates='person')
    claims : Mapped[List["Claim"]] = relationship(back_populates='claimer', cascade="all, delete")

    @property
    def fullname(self):
        return self.lastname + ' ' + self.firstname + ' ' + self.secondname

    def update(self, **kwargs):
        try:
            self.birthday = datetime.strptime(kwargs['birthday'], '%Y-%m-%d')
        except: pass
        self.lastname = kwargs.get('lastname') if kwargs.get('lastname') else self.lastname
        self.firstname = kwargs.get('firstname') if kwargs.get('firstname') else self.firstname
        self.secondname = kwargs.get('secondname') if kwargs.get('secondname') else self.secondname
        self.gender = kwargs.get('gender') if kwargs.get('gender') else self.gender
        self.phone = kwargs.get('phone') if kwargs.get('phone') else self.phone
        self.snils = kwargs.get('snils') if kwargs.get('snils') else self.snils
        self.comment = kwargs.get('comment') if kwargs.get('comment') else self.comment
        self.passport_id = kwargs.get('passport_id') if kwargs.get('passport_id') else self.passport_id
        self.regaddr_id = kwargs.get('regaddr_id') if kwargs.get('regaddr_id') else self.regaddr_id
        self.factaddr_id = kwargs.get('factaddr_id') if kwargs.get('factaddr_id') else self.factaddr_id

class Claim(BaseNode):
    __tablename__ = 'claim'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    typename: Mapped[str] = mapped_column(String(255))
    attributes: Mapped[str] = mapped_column(String(), nullable=True)
    filed_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    family_id : Mapped[int] = mapped_column(Integer, ForeignKey(Family.id, ondelete="CASCADE"))
    claimer_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id, ondelete="CASCADE"))
    house_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id), nullable=True)
    response: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    response_description: Mapped[str] = mapped_column(String(255), nullable=True)

    documents : Mapped[List[Document]] = relationship(secondary="claim_document", back_populates='claims')

    family : Mapped[Family] = relationship(back_populates="claims")
    claimer : Mapped[Person] = relationship()
    house : Mapped[House] = relationship()

    def update(self, **kwargs):
        try:
            self.filed_on = datetime.strptime(kwargs['filed_on'], '%Y-%m-%d %T:%H:%M')
        except: pass
        self.typename = kwargs.get('typename') if kwargs.get('typename') else self.typename
        self.family_id = kwargs.get('family_id') if kwargs.get('family_id') else self.family_id
        self.claimer_id = kwargs.get('claimer_id') if kwargs.get('claimer_id') else self.claimer_id
        self.response = kwargs.get('response') if kwargs.get('response') else self.response
        self.response_description = kwargs.get('response_description') if kwargs.get('response_description') else self.response_description
        self.actual = kwargs.get('actual') if kwargs.get('actual') else self.actual
        self.attributes = kwargs.get('attributes') if kwargs.get('attributes') else self.attributes


class FamilyPerson(BaseNode):
    __tablename__ = 'family_person'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    family_id : Mapped[int] = mapped_column(Integer, ForeignKey(Family.id, ondelete="CASCADE"))
    person_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id, ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(255), nullable=True)

    family : Mapped[Family] = relationship(back_populates="family_persons")
    person : Mapped[Person] = relationship(back_populates="family_persons")
    UniqueConstraint(family_id, person_id)

    def update(self, **kwargs):
        self.family_id = kwargs.get('family_id') if kwargs.get('family_id') else self.family_id
        self.person_id = kwargs.get('person_id') if kwargs.get('person_id') else self.person_id
        self.role = kwargs.get('role') if kwargs.get('role') else self.role


class ClaimDocument(BaseNode):
    __tablename__ = 'claim_document'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    claim_id : Mapped[int] = mapped_column(Integer, ForeignKey(Claim.id, ondelete="CASCADE"))
    document_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id, ondelete="CASCADE"))
    UniqueConstraint(claim_id, document_id)

class HouseDocument(BaseNode):
    __tablename__ = 'house_document'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    house_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id, ondelete="CASCADE"))
    document_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id, ondelete="CASCADE"))
    UniqueConstraint(house_id, document_id)

class HouseStatus(BaseNode):
    __tablename__ = 'house_status'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    house_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id, ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(255))
    date_from: Mapped[date] = mapped_column(Date, nullable=True)
    date_to: Mapped[date] = mapped_column(Date, nullable=True)
    document_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id), nullable=True)


    
class PersonDocument(BaseNode):
    __tablename__ = 'person_document'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id, ondelete="CASCADE"))
    document_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id, ondelete="CASCADE"))
    UniqueConstraint(person_id, document_id)

    def update(self, **kwargs):
        self.person_id = kwargs['person_id']
        self.document_id = kwargs['document_id']

class PersonHouse(BaseNode):
    __tablename__ = 'person_house'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id, ondelete="CASCADE"))
    house_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id, ondelete="CASCADE"))
    relation : Mapped[str] = mapped_column(String(255), nullable=True)
    attributes : Mapped[str] = mapped_column(String(255), nullable=True)

    date_from: Mapped[date] = mapped_column(Date, nullable=True)
    date_to: Mapped[date] = mapped_column(Date, nullable=True)
    UniqueConstraint(person_id, house_id, relation)

    person : Mapped[Person] = relationship(back_populates='person_houses')
    house : Mapped[House] = relationship(back_populates='person_houses')

    def update(self, **kwargs):
        try:
            self.date_from = datetime.strptime(kwargs['date_from'], '%Y-%m-%d')
        except: pass
        try:
            self.date_to = datetime.strptime(kwargs['date_to'], '%Y-%m-%d')
        except: pass
        self.person_id = kwargs.get('person_id') if kwargs.get('person_id') else self.person_id
        self.house_id = kwargs.get('house_id') if kwargs.get('house_id') else self.person_id
        self.relation = kwargs.get('relation') if kwargs.get('relation') else self.relation
        self.comment = kwargs.get('comment') if kwargs.get('comment') else self.comment
    

if __name__ == '__main__':
    p = Person()