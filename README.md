# API World 2022 PineJS Example Repository

This repository consists of examples for exploring and trying out pinejs. Each example is a single independent node application that runs pinejs as an application server and demonstrates queries to this server. The data models and configurations in each step build on top of the previous step but are executable self contained without cross-references.

# Examples contained in this repository

## 00-init

Single typescript file example on init, load and run pinejs from an SBVR data model using express as HTTP server framework.
There is just one other file imported for a clean database init (delete database function from ./lib) call, which is not pinejs specific.

## 01-basics

Basic data model with relations on resources. No SBVR data constraints.
Using AXIOS as http client namespaced to `httpClient` to executed OData request to the running pinejs application server.

## 02-constraints

Basic data model with relations on resources. SBVR data constraints.
Using AXIOS as http client namespaced to `httpClient` to executed OData request to the running pinejs application server.

# Prerequisites

docker environment with `docker compose` plugin installed. This is needed as this pinejs examples need a postgres database. There is a docker-compose.yml which defines the test database as a postgres service. The `docker compose` commands don't need to be run manually and are triggered by the npm scripts.

# Run the examples

The npm scripts will spin up the database with a `docker compose up` command, execute the example code and OData requests and close the example by calling `docker compose down` to cleanup.

## Initialization

```
git clone https://github.com/fisehara/api-world-22-pinejs
cd api-world-22-pinejs
npm install
```

## Exiting npm targets to run the examples
- `npm run 00-init`
- `npm run 01-basic` 
- `npm run 02-constraints`


![Getting Started](./getting-started.gif)

## FAQ

### Docker container already exists?
1. When stopping the execution with SIGINT (strg-c) the docker compose down trap is called. But when the SIGINT is called to often, the trap is exited without calling docker compose down. Maybe this will leave a postgres db service running that you don't need.


#Background
## Understanding the underlying

For understanding how the SBVR gets translated to the different types of intermediate targets:

- SQL schema / data definition language output
- LF (Logical form) definitions
- abstract SQL
- typescript types

you may run the command `npm run

```
Usage:  [options] [command] <input-file> [output-file]

Options:
  -V, --version                              output the version number
  -e, --engine <engine>                      The target database engine (postgres|websql|mysql), default: postgres (default: "postgres")
  -h, --help                                 display help for command

Commands:
  parse <input-file> [output-file]           parse the input SBVR file into LF
  transform <input-file> [output-file]       transform the input SBVR file into abstract SQL
  compile <input-file> [output-file]         compile the input SBVR file into SQL
  generate-types <input-file> [output-file]  generate typescript types from the input SBVR
  help                                       print the help
```
