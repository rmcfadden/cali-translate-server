create database if not exists translate;
use translate;

create table if not exists projects (
    id int auto_increment primary key,
    name varchar(256) not null unique,
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp
);

create table if not exists project_settings (
    id int auto_increment primary key,
    project_id int not null,
    name varchar(256) not null unique,
    value text not null,
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
    user_id int not null,
    name varchar(128) not null unique,
    secret text not null,
    is_enabled boolean default true,
    is_deleted boolean default false,
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp,
    foreign key (user_id) references users(id)
);

create unique index api_keys_name_unique_index ON api_keys (name);

create table if not exists api_logs (
    id int auto_increment primary key,
    api_key_id int not null,
    ip_address varbinary(16) not null,
    created timestamp default current_timestamp,
    foreign key (api_key_id) references api_keys(id)
);
create index api_logs_api_key_id_index ON api_logs (api_key_id);

create table if not exists caches (
    id int auto_increment primary key,
    project_id int not null,
    name varchar(256) not null unique,
    value text not null,
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp
 );

 create table if not exists api_quotas (
    id int auto_increment primary key,
    api_key_id int not null,    
    max int not null,    
    interval_unit varchar(32) not null,    
    is_enabled bit not null default true,
    updated timestamp default current_timestamp on update current_timestamp,
    created timestamp default current_timestamp,
    foreign key (api_key_id) references api_keys(id)
 );