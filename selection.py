import sqlite3

def selection_to_dict(selection : str, data: list):
    ans = {}
    keys = selection.split(', ')
    for i in range(len(keys)):
        if (c:=keys[i].find("AS")) > 0:
            keys[i] = keys[i][c+3:]
    for row in data:
        ans[row[0] ] = dict(zip(keys, row))
    #print(ans)
    return ans

class Connection:
    def __init__(self):
        self.connection = sqlite3.connect('instance/test.db')
        self.cursor = self.connection.cursor()
    
    def __del__(self):
        self.connection.close()

    def select_claims(self, claim_id = 0):
        selection = "claim.id, claim.type_id, claim_type.name, claim.cathegories, claim.family_id, claim.person_id, claim.document_id, claim.date_time, "\
                    "claim.response_id, claim_response.name, claim.response_document_id, claim.comment"
        
        request = f"""SELECT {selection} FROM claim
                    JOIN claim_type on claim.type_id = claim_type.id
                    JOIN claim_response on claim_response.id = claim.response_id
                    {f"WHERE claim.id = ?" if int(claim_id) > 0 else ""} 
                    ORDER BY claim.date_time DESC"""
        self.cursor.execute(request, (claim_id, )) if int(claim_id) > 0 else self.cursor.execute(request)
        result = selection_to_dict(selection, self.cursor.fetchall())
        return result

    def select_claims_of_family(self, family_id = 0):
        selection = "claim.id, claim.type_id, claim_type.name, claim.cathegories, claim.family_id, claim.person_id, claim.document_id, claim.date_time, "\
                    "claim.response_id, claim_response.name, claim.response_document_id, claim.comment"
        
        request = f"""SELECT {selection} FROM claim
                    JOIN claim_type on claim.type_id = claim_type.id
                    JOIN claim_response on claim_response.id = claim.response_id
                    WHERE claim.family_id = ?
                    ORDER BY claim.date_time DESC"""
        self.cursor.execute(request, (family_id, ))
        result = selection_to_dict(selection, self.cursor.fetchall())
        return result
    
    def select_claim_types(self):
        selection = "claim_type.id, claim_type.name"
        self.cursor.execute(f""" SELECT {selection} FROM claim_type""")
        return selection_to_dict(selection, self.cursor.fetchall())

    def select_documents(self, document_id = 0):
        selection = "document.id, document.type_id, document_type.name, document.name, document.series, document.number, "\
                    "document.issuer, document.issue_date, document.comment, document.file, document.attributes"
        
        request = f"""SELECT {selection} FROM document
                    JOIN document_type on document.type_id = document_type.id
                    {f"WHERE document.id = ?" if int(document_id) > 0 else ""} 
                    ORDER BY document.id DESC"""
        self.cursor.execute(request, (document_id, )) if int(document_id) > 0 else self.cursor.execute(request)
        result = selection_to_dict(selection, self.cursor.fetchall())
        return result
    
    def select_documents_of_person(self, person_id = 0):
        selection = "document.id, document.type_id, document_type.name, document.name, document.series, document.number, "\
                    "document.issuer, document.issue_date, document.comment, document.file, document.attributes"
        
        request = f"""SELECT {selection} FROM document
                    JOIN document_type on document.type_id = document_type.id
                    JOIN person_document on person_document.document_id = document.id
                    JOIN person on person_document.person_id = person.id 
                    WHERE person.id = ?
                    ORDER BY document.id DESC"""
        self.cursor.execute(request, (person_id, ))
        result = selection_to_dict(selection, self.cursor.fetchall())
        return result
    
    def select_documents_of_house(self, house_id = 0):
        selection = "document.id, document.type_id, document_type.name, document.name, document.series, document.number, "\
                    "document.issuer, document.issue_date, document.comment, document.file, document.attributes"""
        
        request = f"""SELECT {selection} FROM document
                    JOIN document_type on document.type_id = document_type.id
                    JOIN house_document on house_document.document_id = document.id
                    WHERE house_document.house_id = ?
                    ORDER BY document.id DESC"""
        self.cursor.execute(request, (house_id, ))
        result = selection_to_dict(selection, self.cursor.fetchall())
        print(result)
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
    
    def select_families_with_persons_and_claims(self, person_id = 0):
        selection = "family.id, family.type_id, family_type.name"

        request = f""" SELECT {selection} FROM family 
                    JOIN family_type ON family_type.id = family.type_id 
                    {"JOIN family_person ON family_person.family_id = family.id WHERE family_person.person_id = ?" if int(person_id) > 0 else ""}
                    ORDER BY family.id DESC"""

        self.cursor.execute(request, (person_id, )) if int(person_id) > 0 else self.cursor.execute(request)
        family_list = selection_to_dict(selection, self.cursor.fetchall())
        for family_id, family in family_list.items():
            family["persons"] = self.select_persons_of_family(family_id)
            family["claims"] = self.select_claims_of_family(family_id)
        return family_list
    
    def select_family_types(self):
        selection = "family_type.id, family_type.name"
        self.cursor.execute(f""" SELECT {selection} FROM family_type""")
        family_list = selection_to_dict(selection, self.cursor.fetchall())
        return family_list
    
    def select_houses(self, house_id = 0, filter : dict = {}):
        print(filter)
        selection = "house.id, house.region, house.city, house.prefix, house.street, house.house, house.flat, house.area, house.comment, "\
                    "group_concat(house_status_type.name) AS house_type_list"
        request = f"SELECT {selection} FROM house  "\
                    "LEFT JOIN house_status ON house_status.house_id = house.id "\
                    "LEFT JOIN house_status_type ON house_status_type.id = house_status.type_id "\
                    "WHERE house_status.actual = '1' OR house_status.actual IS NULL "\
                    "GROUP BY house.id "\
                    f"{'HAVING house.id=?' if int(house_id) > 0 else ""} "\
                    "ORDER BY house.region, house.city, house.street, house.house, house.flat "
        r = []
        for key, value in filter.items():
            if value=='1':
                r.append(f"house_type_list LIKE '%{key}%'")
            if value=='-1':
                r.append(f"house_type_list NOT LIKE '%{key}%'")
        if len(r) > 0:
            wh = ' AND '.join(r)
            request = f"SELECT * from ({request}) WHERE {wh}"
            print(request)

        self.cursor.execute(request, (house_id, )) if int(house_id) > 0 else self.cursor.execute(request)
        result = selection_to_dict(selection, self.cursor.fetchall())
        print(result)
        return result
    
    
    def select_houses_expand(self, filter = {}):
        houses = self.select_houses(filter=filter)
        for house_id, house in houses.items():
            #house["statuses"] = self.select_house_statuses(house_id)
            house["persons"] = self.select_persons_of_house(house_id, only_actual=True)
        #print(houses)
        return houses
    
    def select_houses_of_person(self, person_id):
        selection = "house.id, house.region, house.city, house.prefix, house.street, house.house, house.flat, house.area, house.comment, "\
                    "person_house_relation.id, person_house_relation.type_id, person_house_relation_type.name, "\
                    "person_house_relation.actual, person_house_relation.attribute, person_house_relation.date_of_start, person_house_relation.date_of_finish"
        request = f"SELECT {selection} FROM house "\
                    "JOIN person_house_relation ON person_house_relation.house_id = house.id "\
                    "JOIN person_house_relation_type ON person_house_relation_type.id = person_house_relation.type_id "\
                    "WHERE person_house_relation.person_id = ? "\
                    "ORDER BY house.region, house.city, house.street, house.house, house.flat"
        self.cursor.execute(request, (person_id, ))
        return selection_to_dict(selection, self.cursor.fetchall())
    
    def select_house_statuses(self, house_id = 0):
        selection = "house_status.id, house_status.house_id, house_status.type_id, house_status_type.name, "\
                    "house_status.date_of_status, house_status.actual, house_status.date_of_cancel, house_status.comment"
        request =  f"SELECT {selection} FROM house_status "\
                    "JOIN house_status_type ON house_status_type.id = house_status.type_id "\
                    "WHERE house_status.house_id = ?"
        self.cursor.execute(request, (house_id, ))
        return selection_to_dict(selection, self.cursor.fetchall())
    
    def select_house_status_types(self):
        selection = "house_status_type.id, house_status_type.name"
        request =  f"SELECT {selection} FROM house_status_type "
        self.cursor.execute(request)
        return selection_to_dict(selection, self.cursor.fetchall())
        
    def select_persons(self, person_id : int = 0):
        selection = "person.id, person.lastname, person.firstname, person.secondname, person.birthdate, "\
                    "person.passport_id, passport.type_id, passport_type.name, passport.name, passport.series, passport.number, passport.issuer, passport.issue_date, "\
                    "person.house_reg_id, house_r.region, house_r.city, house_r.prefix, house_r.street, house_r.house, house_r.flat, "\
                    "person.house_res_id, house_f.region, house_f.city, house_f.prefix, house_f.street, house_f.house, house_f.flat"
        
        request = f"""SELECT
                    {selection}
                    FROM person
                    LEFT JOIN document AS passport ON passport.id = person.passport_id
                    LEFT JOIN document_type AS passport_type ON passport_type.id = passport.type_id
                    LEFT JOIN house AS house_r ON person.house_reg_id = house_r.id
                    LEFT JOIN house AS house_f ON person.house_res_id = house_f.id
                    {"WHERE person.id = ?" if int(person_id) > 0 else ""}
                    ORDER BY person.id DESC;"""
        
        self.cursor.execute(request, (person_id, )) if int(person_id) > 0 else self.cursor.execute(request)
        result = self.cursor.fetchall()
        return selection_to_dict(selection, result)
    
    def select_persons_of_document(self, document_id):
        selection = "person.id, person.lastname, person.firstname, person.secondname, person.birthdate, "\
                    "person.passport_id, passport.series, passport.number, passport.issuer, passport.issue_date"
        
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
        selection = "person.id, person.lastname, person.firstname, person.secondname, family_person.role, person.birthdate, "\
                    "person.passport_id, passport.series, passport.number, passport.issuer, passport.issue_date"
        
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
    
    def select_persons_of_house(self, house_id, only_actual = False):
        selection = "person.id, person.lastname, person.firstname, person.secondname, person.birthdate, "\
                    "person.passport_id, passport.series, passport.number, passport.issuer, passport.issue_date, "\
                    "person_house_relation.id, "\
                    "person_house_relation.house_id, person_house_relation.type_id, person_house_relation_type.name, "\
                    "person_house_relation.actual, person_house_relation.attribute, person_house_relation.date_of_start, person_house_relation.date_of_finish"
        
        self.cursor.execute(f"""SELECT {selection} FROM person
                            LEFT JOIN document AS passport ON passport.id = person.passport_id
                            JOIN person_house_relation ON person.id = person_house_relation.person_id
                            JOIN person_house_relation_type ON person_house_relation_type.id = person_house_relation.type_id
                            WHERE person_house_relation.house_id = ? {" AND person_house_relation.actual = '1'" if only_actual else ""}""", 
                            (house_id, ))
        result = self.cursor.fetchall()
        return selection_to_dict(selection, result)
    
    def select_person_house_relation_types(self):
        selection = "person_house_relation_type.id, person_house_relation_type.name"
        request =  f"SELECT {selection} FROM person_house_relation_type "
        self.cursor.execute(request)
        return selection_to_dict(selection, self.cursor.fetchall())
    
    def add_family_person(self, family_id, person_id, role = ''):
        self.cursor.execute(f"""insert or ignore into family_person(family_id, person_id, role) VALUES (?, ?, ?)""", (family_id, person_id, role))
        self.connection.commit()

    def add_house_document(self, house_id, document_id):
        self.cursor.execute(f"""insert or ignore into house_document(document_id, house_id) VALUES (?, ?)""", (document_id, house_id))
        self.connection.commit()
    
    def add_person_document(self, person_id, document_id):
        self.cursor.execute(f"""insert or ignore into person_document(document_id, person_id) VALUES (?, ?)""", (document_id, person_id))
        self.connection.commit()

    def add_person_house(self, person_id, house_id):
        self.cursor.execute(f"""insert or ignore into person_house_relation(house_id, person_id) VALUES (?, ?)""", (house_id, person_id))
        self.connection.commit()

    def create_document(self, data):
        self.cursor.execute(f"""INSERT INTO document(type_id, name, series, number, issuer, issue_date, attributes, comment) VALUES
                            (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id""", 
                            (data['type_id'], data['name'], data['series'], data['number'], data['issuer'], data['issue_date'], data['attributes'], data['comment']))
        id = self.cursor.fetchone()[0]
        self.connection.commit()
        return id

    def create_family(self, data):
        self.cursor.execute("""INSERT INTO family(type_id) VALUES (?) RETURNING id""", data['type_id'])
        id = self.cursor.fetchone()[0]
        self.connection.commit()
        return id
    
    def create_house(self, data):
        self.cursor.execute(f"""INSERT INTO house(region, city, prefix, street, house, flat, area, comment) VALUES
                            (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id""", 
                            (data['region'], data['city'], data['prefix'], data['street'], data['house'], data['flat'], data['area'], data['comment']))
        id = self.cursor.fetchone()[0]
        self.connection.commit()
        return id
    
    def create_house_status(self, house_id, data):
        self.cursor.execute(f"""INSERT INTO house_status(house_id, type_id, date_of_status, actual, date_of_cancel, comment) VALUES 
                            (?, ?, date(?), ?, date(?), ?) RETURNING id """, 
                            (house_id, data['type_id'], data['date_of_status'], data['actual'], data['date_of_cancel'], data['comment']))
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
    
    def delete_house_document(self, house_id, document_id):
        self.cursor.execute("""DELETE FROM house_document WHERE document_id =? AND house_id = ?""", (document_id, house_id))
        self.connection.commit()
    
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

    def update_reg(self, person_id, house_id):
        self.cursor.execute("""UPDATE person SET house_reg_id = ? WHERE id=?""", (house_id, person_id))
        self.connection.commit()

    def update_fact(self, person_id, house_id):
        self.cursor.execute("""UPDATE person SET house_res_id = ? WHERE id=?""", (house_id, person_id))
        self.connection.commit()

    def update_family(self, family_id, data):
        self.cursor.execute("""UPDATE family SET type_id = ? WHERE id=?""", (data['type_id'], family_id))
        self.connection.commit()

    def update_house(self, house_id, data):
        self.cursor.execute(f"""UPDATE house SET region = ?, city = ?, prefix = ?, street = ?, house = ?, flat = ?, area = ?, comment = ?
                            WHERE id=?""", 
                            (data['region'], data['city'], data['prefix'], data['street'], data['house'], data['flat'], data['area'], data['comment'], house_id))
        self.connection.commit()

    def update_house_status(self, id, data):
        self.cursor.execute(f"""UPDATE house_status SET type_id=?, date_of_status=?, actual=?, date_of_cancel=?, comment = ?
                            WHERE id=?""", 
                            (data['type_id'], data['date_of_status'], data['actual'], data['date_of_cancel'], data['comment'], id))
        self.connection.commit()

    def update_person(self, person_id, data):
        self.cursor.execute(f"""UPDATE person 
                    SET lastname = "{data['lastname']}",
                    firstname = '{data["firstname"]}',
                    secondname = '{data["secondname"]}',
                    birthdate = date('{data["birthdate"]}')
                    WHERE id={person_id}""")
        self.connection.commit()

    def update_person_house_relation(self, id, data):
        self.cursor.execute(f"""UPDATE person_house_relation SET type_id=?, date_of_start=date(?), actual=?, date_of_finish=date(?)
                            WHERE id=?""", 
                            (data['type_id'], data['date_of_start'], data['actual'], data['date_of_finish'], id))
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



