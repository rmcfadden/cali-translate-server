create database if not exists translate;
use translate;

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
