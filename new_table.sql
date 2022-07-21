\c biztime

CREATE TABLE industries (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE comp_ind (
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    ind_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    PRIMARY KEY (comp_code, ind_code)
);

INSERT INTO industries (code, name)
    VALUES ('tech', 'Technology'),
            ('manu', 'Manufacturing'),
            ('fin', 'Finance'),
            ('agr', 'Agriculture'),
            ('mrk', 'Marketing');