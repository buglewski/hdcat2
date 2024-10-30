
SELECT * from meow;


-- view all table with persons
SELECT 
person.id, person.lastname, person.firstname, person.secondname, person.birthdate,
document.series, document.number, document.issuer, document.issue_date,
house_r.prefix as r_pref, house_r.street as r_str, house_r.flat as r_flat,
house_f.prefix as f_pref, house_f.street as f_str, house_f.flat as f_flat
from person
join document on document.id = person.passport_id
join house as house_f on person.house_reg_id = house_f.id
join house as house_r on person.house_res_id = house_r.id;

SELECT 
person.id, person.lastname, person.firstname, person.secondname, person.birthdate,
document.series, document.number, document.issuer, document.issue_date,
house_r.prefix || house_r.street || " " || house_r.house || "-" || house_r.flat as reg_addr,
house_f.prefix || house_f.street || " " || house_r.house || "-" || house_f.flat as res_addr
from person
join document on document.id = person.passport_id
join house as house_f on person.house_reg_id = house_f.id
join house as house_r on person.house_res_id = house_r.id

END TRANSACTION;
BEGIN TRANSACTION; -- if houses is in table

INSERT INTO document(type_id, name, series, number, issuer, issue_date) VALUES
			(2, "Паспорт Стальновой Д.Ж.", "0118", "243282", "ГУП ГОРЭЛЕКТРОТРАНС", date("2021-02-23"))
			RETURNING id;
			
INSERT INTO person(lastname, firstname, secondname, birthdate, phone, passport_id, house_reg_id, house_res_id) VALUES
("Стальнова", "Дарья", "Жульевна", date("1998-12-01"), "114-440", (select last_insert_rowid() from document LIMIT 1), 2, 2)
RETURNING *;

INSERT INTO person_document(person_id, document_id) VALUES
(12, 22);

INSERT INTO "person_house_relation"("person_id", "house_id", "relation_id") VALUES
(12, 2, 2),
(12, 2, 3)

INSERT INTO family_person(family_id, person_id) VALUES
(3, 12)