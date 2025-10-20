create database if not exists translate;
use translate;

create table if not exists projects (
    id int auto_increment primary key,
    name varchar(256) not null unique,
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp
 );


create table if not exists users (
    id int auto_increment primary key,
    username varchar(128) not null unique,
    password_hash varchar(256) not null,
    is_enabled boolean default true,
    is_deleted boolean default false,
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp
);

create table if not exists api_keys (
    id int auto_increment primary key,
    name varchar(128) not null unique,
    secret text not null,
    is_enabled boolean default true,
    is_deleted boolean default false,
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp
);

create table if not exists api_keys_users (
    id int auto_increment primary key,
    api_key_id int not null,
    user_id int not null,
    created timestamp default current_timestamp,
    foreign key (api_key_id) references api_keys(id),
    foreign key (api_key_id) references users(id)
);
create unique index api_keys_users_unique_index ON api_keys_users (api_key_id, user_id);

create table if not exists api_logs (
    id int auto_increment primary key,
    api_key_id int not null,
    ip_address varbinary(16) not null
    created timestamp default current_timestamp,
    foreign key (api_key_id) references api_keys(id),
    foreign key (api_key_id) references users(id)
);
create index api_logs_api_key_id_index ON api_keys_users (api_key_id);

create table if not exists caches (
    id int auto_increment primary key,
    project_id int not null
    name varchar(256) not null unique,
    value longtext not null,    export type Project = {
      id: number;
      name: string;
      updated: Date;
      created: Date;
    };    export type Project = {
      id: number;
      name: string;
      updated: Date;
      created: Date;
    };
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp
 );
create unique index api_keys_users_unique_index ON api_keys_users (api_key_id, user_id);


--insert into api_logs (api_key_id, user_id, ip_address) values (1, 1, inet6_aton('192.0.2.1'));