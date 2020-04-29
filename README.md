# GoURMET Translation API

The GoURMET Translation API has been build as part of the [GoURMET Project](https://gourmet-project.eu/). It's purpose to to provide a single platform where all translation models produced as part of the GoURMET project can be hosted, run and accessed rather than forcing the user of the translation technology to need to integrate the translation models into the project directly. This allows a single point for maintenance and upgrades to the translation models.

## Contents

1. [Architecture](./docs/architecture.md)

## Infrastructure

The API is build using AWS Technologies

The translation API provides an interface to expose translation models produced as part of the GoURMET project. These models are shared as docker images and use this [template](https://github.com/bbc/gourmet-translation-module-template) to provide a standardised web app interface with a `/translate` endpoint. To integrate a new model see the [Adding a Translation Model](./docs/addingATranslationModel.md) section.

The API is built using AWS services. This project contains the Cloudformation templates to generate the API infrastructure. The Cloudformation templates are written in javascript using [AWS CDK](https://docs.aws.amazon.com/cdk/).

## Working with AWS CDK

### Setting up CDK

1. Install the cdk command line tool

```
npm install -g aws-cdk
```

2. Check the tool installed correctly with 

```
cdk --version
```

### Building the template

Run: `cdk synth`

The `cdk.json` file tells the CDK Toolkit how to execute the app and build the Cloudformation template.

`cdk synth`: emits the synthesized CloudFormation templates as `*.template.JSON` files in the [cdk.out](./cdk.out)  directory.

