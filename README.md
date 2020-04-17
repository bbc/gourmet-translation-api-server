# GoURMET Translation API

# Translation Models Cluster

The cluster uses ECS. In this instance the containers are running on Fargate.

## CDK

Currently in the process of migrating to using [CDK](https://docs.aws.amazon.com/cdk/) to build the cloudformation template for the architecture that makes up the API.

The `cdk.json` file tells the CDK Toolkit how to execute the app.

### Setting up CDK

1. Install the cdk commandline tool

```
npm install -g aws-cdk
```

2. Check the tool installed correctly with 

```
cdk --version
```

### Building the template

`cdk synth`: emits the synthesized [CloudFormation template](./cdk.out/TranslationApiStack.template.json) in the cdk.out directory.

## Adding a new translation model

1. Open up a port on the ELB by adding an ingress rule to the ELB security group.
2. Add a Task Definition
3. Add a Listener. This should be listening on the port that was opened up in step 1
4. Add a Target Group.
4. Add an ECS Service