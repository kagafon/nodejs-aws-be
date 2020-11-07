CREATE TABLE public.products (
	id uuid DEFAULT gen_random_uuid(),
	title text NOT NULL,
	description text NULL,
	price numeric NULL,
	image varchar(200) DEFAULT '/assets/images/Unknown.svg',
	CONSTRAINT products_pk PRIMARY KEY (id)
);sls

CREATE TABLE public.stocks (
	id uuid DEFAULT gen_random_uuid(),
	count integer NOT NULL,
	product_id uuid NOT NULL,
	CONSTRAINT stocks_pk PRIMARY KEY (id),
	CONSTRAINT stocks_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

insert into products (id, title, description, price) values (gen_random_uuid(), 'Square', 'Most equal square', 25.5);
insert into products (id, title, description, price) values (gen_random_uuid(), 'Circle', 'Best rounded shape', 13.4);
insert into products (id, title, description, price) values (gen_random_uuid(), 'Octagon', 'Fighting shape', 25.5);
insert into products (id, title, description, price) values (gen_random_uuid(), 'Triangle', 'Only three corners', 177.1);
insert into products (id, title, description, price) values (gen_random_uuid(), 'Rhombus', 'Skew this square!', 5.3);
insert into products (id, title, description, price) values (gen_random_uuid(), 'Trapezoid', 'Just another quadrangle', 4.1);
insert into products (id, title, description, price) values (gen_random_uuid(), 'Line segment', 'Base of everything', 72.2);
insert into products (id, title, description, price) values (gen_random_uuid(), 'Hexagon', 'Organic сhemistry, you know', 98.9);

insert into stocks (product_id, count) select id, trunc(random()*40) from products;
commit;