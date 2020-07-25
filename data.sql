DROP DATABASE IF EXISTS biztime;
CREATE DATABASE biztime;

\c biztime;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS company_industry;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('k&e', 'Kirkland & Ellis', 'Largest Law firm in the world.');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);



CREATE TABLE industries(
  code text PRIMARY KEY,
  industry_field text NOT NULL
);
INSERT INTO industries  (code, industry_field)
VALUES('tech', 'Technology'),
      ('acct', 'Accounting'),
      ('telec', 'Telecommunication'),
      ('fd-dl', 'Food-delivery'),
      ('hrdw', 'Hardware'),
      ('sftw', 'Software'),
      ('lgl', 'Legal');


CREATE TABLE company_industry(
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE
);

INSERT INTO company_industry (comp_code, industry_code)
VALUES  ('apple', 'tech'),
        ('apple', 'sftw'),
        ('apple', 'hrdw'),
        ('ibm', 'tech'),
        ('ibm', 'hrdw'),
        ('k&e', 'lgl');
--


-- SELECT i.code, i.industry_field, c.code FROM industries AS i
--         JOIN company_industry AS ci
--         ON i.code = ci.industry_code
--         JOIN companies as c
--         ON c.code = ci.comp_code