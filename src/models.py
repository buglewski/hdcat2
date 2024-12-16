from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timezone
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

db = SQLAlchemy()

class User(db.Model):
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
    created_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    updated_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    

class BaseNode(db.Model):
    __abstract__ = True
    actual: Mapped[bool] = mapped_column(Boolean, default=True)
    created_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    created_by : Mapped[str] = mapped_column(String(255), ForeignKey(User.username), nullable=True)
    updated_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
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
    houses : Mapped[List["House"]] = relationship(secondary="house_document", back_populates="documents")

class Family(BaseNode):
    __tablename__ = 'family'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    typename: Mapped[str] = mapped_column(String(255))

    claims : Mapped[List["Claim"]] = relationship(back_populates='family')
    persons : Mapped[List["Person"]] = relationship(secondary="family_person", back_populates="families")

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
    person_houses : Mapped[List["PersonHouse"]] = relationship(back_populates='house')
    statuses : Mapped[List["HouseStatus"]] = relationship()
        


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
    snils : Mapped[str] = mapped_column(String, ForeignKey(Document.id), nullable=True)
    mother_id : Mapped[int] = mapped_column(Integer, ForeignKey("person.id"), nullable=True)
    father_id : Mapped[int] = mapped_column(Integer, ForeignKey("person.id"), nullable=True)
    spouse_id : Mapped[int] = mapped_column(Integer, ForeignKey("person.id"), nullable=True)

    passport : Mapped[Document] = relationship(foreign_keys=[passport_id])
    housereg : Mapped[House] = relationship(foreign_keys=[regaddr_id])
    housefact : Mapped[House] = relationship(foreign_keys=[factaddr_id])
    mother : Mapped["Person"] = relationship(foreign_keys=[mother_id], remote_side=[id], post_update=True, back_populates='_mchildren')
    father : Mapped["Person"] = relationship(foreign_keys=[father_id], remote_side=[id], post_update=True, back_populates='_fchildren')
    spouse : Mapped["Person"] = relationship(foreign_keys=[spouse_id], remote_side=[id], post_update=True)

    _fchildren : Mapped[List["Person"]] = relationship(foreign_keys=[father_id], post_update=True, back_populates='father')
    _mchildren : Mapped[List["Person"]] = relationship(foreign_keys=[mother_id], post_update=True, back_populates='mother') 

    @property
    def children(self) -> Mapped[List["Person"]]:
        if self.gender == 'MALE':
            return self._fchildren
        elif self.gender == 'FEMALE':
            return self._mchildren
        raise "THERE ARE ONLY TWO GENDERS! - 'MALE' AND 'FEMALE'"

    documents : Mapped[List[Document]] = relationship(secondary="person_document", back_populates='persons')
    families : Mapped[List[Family]] = relationship(secondary="family_person", back_populates='persons')
    person_houses : Mapped[List["PersonHouse"]] = relationship(back_populates='person')

class Claim(BaseNode):
    __tablename__ = 'claim'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    typename: Mapped[str] = mapped_column(String(255))
    attributes: Mapped[str] = mapped_column(String())
    filed_on : Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    family_id : Mapped[int] = mapped_column(Integer, ForeignKey(Family.id))
    claimer_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id))
    response: Mapped[bool] = mapped_column(Boolean, nullable=True, default=None)

    family : Mapped[Family] = relationship(back_populates="claims")
    claimer : Mapped[Person] = relationship()


class FamilyPerson(BaseNode):
    __tablename__ = 'family_person'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    family_id : Mapped[int] = mapped_column(Integer, ForeignKey(Family.id))
    person_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id))
    role: Mapped[str] = mapped_column(String(255), nullable=True)
    UniqueConstraint(family_id, person_id)


class HouseDocument(BaseNode):
    __tablename__ = 'house_document'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    house_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id))
    document_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id))
    UniqueConstraint(house_id, document_id)

class HouseStatus(BaseNode):
    __tablename__ = 'house_status'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    house_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id))
    status: Mapped[str] = mapped_column(String(255))
    date_from: Mapped[date] = mapped_column(Date, nullable=True)
    date_to: Mapped[date] = mapped_column(Date, nullable=True)
    document_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id), nullable=True)


    
class PersonDocument(BaseNode):
    __tablename__ = 'person_document'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id))
    document_id : Mapped[int] = mapped_column(Integer, ForeignKey(Document.id))
    UniqueConstraint(person_id, document_id)

class PersonHouse(BaseNode):
    __tablename__ = 'person_house'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person_id : Mapped[int] = mapped_column(Integer, ForeignKey(Person.id))
    house_id : Mapped[int] = mapped_column(Integer, ForeignKey(House.id))
    relation : Mapped[str] = mapped_column(String(255), nullable=True)
    attributes : Mapped[str] = mapped_column(String(255), nullable=True)
    UniqueConstraint(person_id, house_id, relation)

    person : Mapped[Person] = relationship(back_populates='person_houses')
    house : Mapped[House] = relationship(back_populates='person_houses')
    

if __name__ == '__main__':
    p = Person()