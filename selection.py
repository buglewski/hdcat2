import sqlite3

def selection_to_dict(selection : str, data: list):
    ans = []
    keys = selection.replace(',', '').split()
    for row in data:
        ans.append(dict(zip(keys, row)))
    return ans

class Connection:
    def __init__(self):
        self.connection = sqlite3.connect('instance/test.db')
        self.cursor = self.connection.cursor()
    
    def __del__(self):
        self.connection.close()

    def select_documents(self, document_id = 0):
        selection = """document.id, document.type_id, document_type.name, document.name, document.series, document.number,
                        document.issuer, document.issue_date, document.comment, document.file, document.attributes"""
        
        request = f"""SELECT {selection} FROM document
                    JOIN document_type on document.type_id = document_type.id
                    {f"WHERE document.id = ?" if int(document_id) > 0 else ""} 
                    ORDER BY document.id DESC"""
        self.cursor.execute(request, (document_id, )) if int(document_id) > 0 else self.cursor.execute(request)
        result = selection_to_dict(selection, self.cursor.fetchall())
        return result
    
    def select_documents_of_person(self, person_id = 0):
        selection = """document.id, document.type_id, document_type.name, document.name, document.series, document.number,
                        document.issuer, document.issue_date, document.comment, document.file, document.attributes"""
        
        request = f"""SELECT {selection} FROM document
                    JOIN document_type on document.type_id = document_type.id
                    {f"""JOIN person_document on person_document.document_id = document.id
                    JOIN person on person_document.person_id = person.id 
                    WHERE person.id = ?""" if int(person_id) > 0 else ""}
                    ORDER BY document.id DESC"""
        self.cursor.execute(request, (person_id, )) if int(person_id) > 0 else self.cursor.execute(request)
        result = selection_to_dict(selection, self.cursor.fetchall())
        return result
    
    def select_document_type(self):
        selection = "document_type.id, document_type.name"
        self.cursor.execute(f"""SELECT {selection} from document_type""")
        return selection_to_dict(selection, self.cursor.fetchall())

    def select_families(self, family_id = 0):
        selection = "family.id, family.type_id, family_type.name"

        request = f"""SELECT {selection} FROM family JOIN family_type ON family_type.id = family.type_id 
                    {"WHERE family.id=?" if int(family_id) > 0 else ""}
                    ORDER BY family.id DESC"""
        
        self.cursor.execute(request, (family_id, )) if int(family_id) > 0 else self.cursor.execute(request)
        result = selection_to_dict(selection, self.cursor.fetchall())
        return result
    
    def select_families_with_persons(self, person_id = 0):
        selection = "family.id, family.type_id, family_type.name"

        request = f""" SELECT {selection} FROM family 
                    JOIN family_type ON family_type.id = family.type_id 
                    {"JOIN family_person ON family_person.family_id = family.id WHERE family_person.person_id = ?" if int(person_id) > 0 else ""}
                    ORDER BY family.id DESC"""

        self.cursor.execute(request, (person_id, )) if int(person_id) > 0 else self.cursor.execute(request)
        family_list = selection_to_dict(selection, self.cursor.fetchall())
        for family in family_list:
            family["persons"] = (self.select_persons_of_family(family["family.id"]))
        return family_list
    
    def select_family_types(self):
        selection = "family_type.id, family_type.name"
        self.cursor.execute(f""" SELECT {selection} FROM family_type""")
        family_list = selection_to_dict(selection, self.cursor.fetchall())
        return family_list
    
    def select_houses(self, house_id = 0):
        selection = "house.id, house.region, house.city, house.prefix, house.street, house.house, house.flat, house.area, house.comment"
        request = f"SELECT {selection} FROM house {"WHERE house.id=?" if int(house_id) > 0 else ""}"\
                    "ORDER BY house.region, house.city, house.street, house.house, house.flat"
        self.cursor.execute(request, (house_id, )) if int(house_id) > 0 else self.cursor.execute(request)
        return selection_to_dict(selection, self.cursor.fetchall())
    
    
    def select_houses_expand(self):
        houses = self.select_houses()
        for house in houses:
            house["statuses"] = self.select_house_statuses(house["house.id"])
            house["persons"] = self.select_persons_of_house(house["house.id"])
        print(houses)
        return houses
    
    def select_house_statuses(self, house_id = 0):
        selection = "house_status.id, house_status.house_id, house_status.type_id, house_status_type.name, "\
                    "house_status.date_of_status, house_status.actual, house_status.date_of_cancel, house_status.comment"
        request =  f"SELECT {selection} FROM house_status "\
                    "JOIN house_status_type ON house_status_type.id = house_status.type_id "\
                    "WHERE house_status.house_id = ?"
        self.cursor.execute(request, (house_id, ))
        return selection_to_dict(selection, self.cursor.fetchall())
        
    def select_persons(self, person_id : int = 0):
        selection = """person.id, person.lastname, person.firstname, person.secondname, person.birthdate,
                        person.passport_id, passport.type_id, passport_type.name, passport.series, passport.number, passport.issuer, passport.issue_date,
                        person.house_reg_id, house_r.prefix, house_r.street, house_r.house, house_r.flat,
                        person.house_res_id, house_f.prefix, house_f.street, house_f.house, house_f.flat"""
        
        request = f"""SELECT
                    {selection}
                    FROM person
                    LEFT JOIN document AS passport ON passport.id = person.passport_id
                    LEFT JOIN document_type AS passport_type ON passport_type.id = passport.type_id
                    LEFT JOIN house AS house_f ON person.house_reg_id = house_f.id
                    LEFT JOIN house AS house_r ON person.house_res_id = house_r.id
                    {"WHERE person.id = ?" if int(person_id) > 0 else ""}
                    ORDER BY person.id DESC;"""
        
        self.cursor.execute(request, (person_id, )) if int(person_id) > 0 else self.cursor.execute(request)
        result = self.cursor.fetchall()
        return selection_to_dict(selection, result)
    
    def select_persons_of_document(self, document_id):
        selection = """person.id, person.lastname, person.firstname, person.secondname, person.birthdate, 
                        person.passport_id, passport.series, passport.number, passport.issuer, passport.issue_date"""
        
        self.cursor.execute(f"""SELECT
                            {selection}
                            FROM person
                            LEFT JOIN document AS passport ON passport.id = person.passport_id
                            JOIN person_document ON person.id = person_document.person_id
                            WHERE person_document.document_id = ?""", 
                            (document_id, ))
        result = self.cursor.fetchall()
        return selection_to_dict(selection, result)

    def select_persons_of_family(self, family_id):
        selection = """person.id, person.lastname, person.firstname, person.secondname, family_person.role, person.birthdate, 
                        person.passport_id, passport.series, passport.number, passport.issuer, passport.issue_date"""
        
        self.cursor.execute(f"""SELECT
                            {selection}
                            FROM person
                            LEFT JOIN document AS passport ON passport.id = person.passport_id
                            JOIN family_person ON person.id = family_person.person_id
                            WHERE family_person.family_id = ?""", 
                            (family_id, ))
        result = self.cursor.fetchall()
        #print(result)
        return selection_to_dict(selection, result)
    
    def select_persons_of_house(self, house_id):
        selection = "person.id, person.lastname, person.firstname, person.secondname, person.birthdate, "\
                    "person.passport_id, passport.series, passport.number, passport.issuer, passport.issue_date, "\
                    "person_house_relation.house_id, person_house_relation.relation_id, person_house_relation_type.name, "\
                    "person_house_relation.actual, person_house_relation.attribute, person_house_relation.date_of_start, person_house_relation.date_of_finish"
        
        self.cursor.execute(f"""SELECT {selection} FROM person
                            LEFT JOIN document AS passport ON passport.id = person.passport_id
                            JOIN person_house_relation ON person.id = person_house_relation.person_id
                            JOIN person_house_relation_type ON person_house_relation_type.id = person_house_relation.relation_id
                            WHERE person_house_relation.house_id = ? """, 
                            (house_id, ))
        result = self.cursor.fetchall()
        return selection_to_dict(selection, result)
    
    def add_family_person(self, family_id, person_id, role = ''):
        self.cursor.execute(f"""insert or ignore into family_person(family_id, person_id, role) VALUES (?, ?, ?)""", (family_id, person_id, role))
        self.connection.commit()
    
    def add_person_document(self, person_id, document_id):
        self.cursor.execute(f"""insert or ignore into person_document(document_id, person_id) VALUES (?, ?)""", (document_id, person_id))
        self.connection.commit()

    def create_family(self, data):
        self.cursor.execute("""INSERT INTO family(type_id) VALUES (?) RETURNING id""", data['type_id'])
        id = self.cursor.fetchone()[0]
        self.connection.commit()
        return id
    
    def create_document(self, data):
        self.cursor.execute(f"""INSERT INTO document(type_id, name, series, number, issuer, issue_date, attributes, comment) VALUES
                            (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id""", 
                            (data['type_id'], data['name'], data['series'], data['number'], data['issuer'], data['issue_date'], data['attributes'], data['comment']))
        id = self.cursor.fetchone()[0]
        self.connection.commit()
        return id

    def create_person(self, data):
        self.cursor.execute(f"""INSERT INTO person(lastname, firstname, secondname, birthdate) VALUES 
                    ("{data['lastname']}", '{data["firstname"]}','{data["secondname"]}', date('{data["birthdate"]}'))
                    RETURNING id""")
        id = self.cursor.fetchone()[0]
        self.connection.commit()
        return id
    
    def delete_person_document(self, person_id, document_id):
        self.cursor.execute("""DELETE FROM person_document WHERE document_id =? AND person_id = ?""", (document_id, person_id))
        self.connection.commit()

    def delete_family_person(self, family_id, person_id):
        self.cursor.execute("""DELETE FROM family_person WHERE family_id =? AND person_id = ?""", (family_id, person_id))
        self.connection.commit()

    def update_document(self, document_id, data):
        self.cursor.execute(f"""UPDATE document
                        SET type_id = ?, name = ?, series = ?, number=?, issuer=?, issue_date = date(?), attributes = ?,comment= ?
                        WHERE id=?""",
                        (data['type_id'], data['name'], data['series'], data['number'], data['issuer'], data['issue_date'], data['attributes'], data['comment'], document_id))
        self.connection.commit()

    def update_dul(self, person_id, document_id):
        self.cursor.execute("""UPDATE person SET passport_id = ? WHERE id=?""", (document_id, person_id))
        self.connection.commit()

    def update_family(self, family_id, data):
        self.cursor.execute("""UPDATE family SET type_id = ? WHERE id=?""", (data['type_id'], family_id))
        self.connection.commit()

    def update_person(self, person_id, data):
        self.cursor.execute(f"""UPDATE person 
                    SET lastname = "{data['lastname']}",
                    firstname = '{data["firstname"]}',
                    secondname = '{data["secondname"]}',
                    birthdate = date('{data["birthdate"]}')
                    WHERE id={person_id}""")
        self.connection.commit()

    def update_role(self, family_id, person_id, role):
        self.cursor.execute("""UPDATE family_person SET role = ? WHERE family_id=? AND person_id=?""", (role, family_id, person_id))
        self.connection.commit()

if __name__ == "__main__":
    # Устанавливаем соединение с базой данных
    connection = sqlite3.connect('instance/test.db')
    cursor = connection.cursor()

    # Выбираем всех пользователей
    cursor.execute("""SELECT
                    person.id, person.lastname, person.firstname, person.secondname, person.birthdate,
                    document.series, document.number, document.issuer, document.issue_date,
                    house_r.prefix as r_pref, house_r.street as r_str, house_r.flat as r_flat,
                    house_f.prefix as f_pref, house_f.street as f_str, house_f.flat as f_flat
                    from person
                    join document on document.id = person.passport_id
                    join house as house_f on person.house_reg_id = house_f.id
                    join house as house_r on person.house_res_id = house_r.id;""")
    

    users = cursor.fetchall()

    # Выводим результаты
    for user in users:
        print(user)

    # Закрываем соединение
    connection.close()



