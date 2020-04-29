# GoURMET Translation API

The GoURMET Translation API has been build as part of the [GoURMET Project](https://gourmet-project.eu/). It's purpose to to provide a single platform where all translation models produced as part of the GoURMET project can be hosted, run and accessed rather than forcing the user of the translation technology to need to integrate the translation models into the project directly. This allows a single point for maintenance and upgrades to the translation models.

## Contents

1. [Architecture](./docs/architecture.md)

## Infrastructure

The API is build using AWS Technologies

The translation API provides an interface to expose translation models produced as part of the GoURMET project. These models are shared as docker images and use this [template](https://github.com/bbc/gourmet-translation-module-template) to provide a standardised web app interface with a `/translate` endpoint. To integrate a new model see the [Adding a new Translation Model](#adding-a-new-translation-model) section.

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

## Adding a new translation model

Requirements:
- [Docker installed locally](https://docs.docker.com/get-docker/)
- [AWS CLI Tool](https://aws.amazon.com/cli/)
- Local AWS Credentials for the GoURMET AWS account in the `~/.aws/credentials` file.
- [CDK](#setting-up-cdk)

### 1. Test new Docker Image locally

The Docker Images are shared by the universities as either GZIP Compressed Tar Archive file (`.tgz` extension) or just Tar Archive files (`.tar` extension).

1. Download the file locally. The download and upload will be slow if it is a large image so there are [instructions](#test-and-host-docker-images-ec2) to run the 'Test new Docker Image locally` and 'Hosting Docker Images' steps on EC2. This should be much quicker.

`wget https://www.something.com/img.tgz`

2. Import the image file into Docker.

`docker load < NAME_OF_FILE.tgz`

3. Run the image exposing port 4000.

`docker run -p 4000:4000 IMAGE_NAME`

4. Curl the container's `/translation` end point.

`curl -X POST -d '{"q": "Text to translate"}' -H "Content-Type: application/json" -v localhost:4000/translation`.

To use a json file to hold the request data 

`curl -X POST -d '@data.json' -H "Content-Type: application/json" -v localhost:4000/translation`

Where `data.json` is `{"q": "Text to translate"}`. If the model returns non latin characters the unicode will [need decoding](https://www.online-toolz.com/tools/text-unicode-entities-convertor.php).

### 2. Hosting Docker Images

The Docker images are hosted on [Elastic Container Registry](https://aws.amazon.com/ecr/) in the GoURMET BBC AWS account

1. Create a repository via the AWS Console. The name should be of the form `translation-LANGUAGE_CODE_FROM-LANGUAGE_CODE_TO` where the language codes are [ISO 369-1](https://en.wikipedia.org/wiki/ISO_639-1) e.g. `translation-bg-en` for the translation model going from Bulgarian to English
2. Tag the Docker Image with the URI of the repository created in step 1 and a version number. Version numbers should start from v0.1

`docker tag CURRENT_IMAGE_NAME REPOSITORY_URI:v0.1`

3. Also tag the Docker image with the `latest` tag

`docker tag REPOSITORY_URI:v0.1 REPOSITORY_URI:latest`

4. Log in to ECR so that the image can be pushed to the ECR repository created. The registry id is the number at the start of the Registry URI. The command below outputs a docker command as a string so that it is possible to push to ECR. The docker command needs to be run as well so it is piped into `sh` which will run it.

`aws ecr get-login --registry-ids AWS_ACCOUNT_ID --region eu-west-1 --no-include-email | sh`

5. Push the image up to the ECR registry with both the `latest` and `v0.1` tag. This requires 2 pushes. The first one will probably be slow depending on the size of the image.

```
docker push REPOSITORY_URI:latest
docker push REPOSITORY_URI:v0.1
```

### 3. Integrating the Docker Image into the Cluster

The `addLanguage` function creates the infrastructure required to add another Docker image.

1. In the [`translation-api-cluster-stack.js`](./lib/translation-api-cluster-stack.js) define the port that the image will run on at the top of the file
2. Call `addLanguage`. This requires:
- scope - scope infrastructure will be created in. This should be the stack.
- languagePair - name of the language pair e.g. bg-en
- port - port that the model will be available on via the load balancer
- dockerImageUrl - This is the URI plus tag from ECR
- cluster - cluster the service and task will be created in. The existing cluster should be used.
- loadBalancer - load balancer that will manage traffic to the service. The existing load balancer should be used.
- ecrAccessRole - IAM role to allow task definition to get docker image from ECR. The existing role should be used.
- logGroup - log group that the log driver will log to. The existing log group should be used.

The `addLanguage` function creates a new ECS Task Definition and ECS Service and allows traffic on the port specified via the load balancer.

3. Generate the updated Cloudformation template for the infrastructure using `cdk synth`. This will update the [TranslationApiClusterStack.template.json](./cdk.out/TranslationApiClusterStack.template.json) file.
4. Update the Translation API cluster stack in ***REMOVED*** using the new JSON template.

### Test and host Docker Images EC2

It is possible to run the test and host steps of Adding a new translation model on your local machine but the download and push steps are likely to be slow so the steps can also be run on an EC2 instance

1. Create a IAM Role in the AWS Console.
- This should be an EC2 Role for an AWS service
- Under permissions attach the `AmazonEC2ContainerRegistryFullAccess` policy
- Give it a memorable name as this Role must be destroyed after the [Test](###1-test-new-docker-image-locally) and [Host](#2-hosting-docker-images) steps are complete
2. Create a new EC2 instance in the AWS Console
- When choosing an AMI I would use 'Docker on Ubuntu 18' or 'Ubuntu 18'. If using Ubuntu 18 docker will need to be installed on the EC2 instance later.
- Choose an instance type with high network performance e.g. one that is 'Up to 10 Gigabit'
- Select 'configure instance details'. Make sure that you auto assign a public IP and under 'IAM Role' select the role created in step 1.
- Select 'add storage' increase the size of the root volume. 32 GiB should be plenty of space.
- Review and launch
- On once you've clicked 'launch' create and download a new key pair using the pop up window. This is what you will use to SSH into the running instance
3. In the AWS Console select the EC2 instance you just created and click 'connect' this will give you the SSH command you need to log in to the EC2 instance from your machine
4. SSH into the machine
5. If the 'Docker on Ubuntu 18' AMI isn't used then [install docker](https://linuxhandbook.com/install-docker-ubuntu/)
6. Do the [Test](###1-test-new-docker-image-locally) and [Host](#2-hosting-docker-images) steps then clean up all resources created in AWS
- Delete IAM Role
- Terminate EC2 Instance
- Delete Key Pair you created. The Key Pair is in EC2 > Key Pairs
