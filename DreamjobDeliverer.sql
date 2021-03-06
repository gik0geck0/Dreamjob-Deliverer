--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.3
-- Dumped by pg_dump version 9.5.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: test_instances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE test_instances (
    test_title character varying(20),
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    url character varying(256) NOT NULL,
    latest_submission bytea,
    name character varying(256),
    email character varying(256),
    submission_filename character varying(256)
);


ALTER TABLE test_instances OWNER TO postgres;

--
-- Name: tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE tests (
    title character varying(20) NOT NULL,
    description character varying(256),
    instructions bytea
);


ALTER TABLE tests OWNER TO postgres;

--
-- Data for Name: test_instances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY test_instances (test_title, start_time, end_time, url, latest_submission, name, email, submission_filename) FROM stdin;
\.


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY tests (title, description, instructions) FROM stdin;
\.


--
-- Name: test_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY test_instances
    ADD CONSTRAINT test_instances_pkey PRIMARY KEY (url);


--
-- Name: tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (title);


--
-- Name: test_instances_test_title_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY test_instances
    ADD CONSTRAINT test_instances_test_title_fkey FOREIGN KEY (test_title) REFERENCES tests(title);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

