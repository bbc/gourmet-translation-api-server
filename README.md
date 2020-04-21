# GoURMET Translation API

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

# Translation API Cluster

The Translation API cluster is the infrastructure that creates containers from the Machine Translation Docker images and allows traffic to be routed to specific images via a load balancer. All machine translation models are delivered as Docker images. [AWS ECS](https://aws.amazon.com/ecs/) is used manage how containers created from the Docker Images run as well as the infrastructure they will run on.

The specific architecture of ECS is shown below. An AWS Cluster has been created which defines the infrastructure the containers will run on. In this specific instance, AWS Fargate is used as it removes the requirement to manage EC2 instances. An AWS Task Definition must be created for each Docker image. The Task Definition defines the properties of a container. This includes which Docker image to use and where to pull the image from, how much CPU power and memory to allocate the container and any AWS IAM Roles the container needs. Containers created using the Task Definitions are referred to as Tasks in AWS. The Tasks have been created within a Service. The Service maintains a specified number of instances of a Task and allows for the number of Tasks to be scaled up or down according to load on the system. The Service also health checks Tasks and destroys and replaces unhealthy ones.

![](./docs/images/ECScluster.png)

Traffic is allowed to each container via a specific port on the Load Balancer. This access is managed using an ECS Service. Each ECS Task has it's own ECS Service. A Listener exists on the Load Balancer for each ECS Service and traffic is directed using a Target Group to the ECS Service so the request can be fulfilled by a Task.

![](./docs/images/LoadBalancer.png)

## Adding a new translation model

Requirements:
- [Docker installed locally](https://docs.docker.com/get-docker/)
- [AWS CLI Tool](https://aws.amazon.com/cli/)
- Local AWS Credentials for the GoURMET AWS account in the `~/.aws/credentials` file.
- [CDK](#setting-up-cdk)

### 1. Test new Docker Image locally

The Docker Images are shared by the universities as either GZIP Compressed Tar Archive file (`.tgz` extension) or just Tar Archive files (`.tar` extension).

1. Download the file locally
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

4. Log in to ECR so that the image can be pushed to the ECR repository created. The registry id is the number at the start of the Registry URI

`aws ecr get-login --registry-ids AWS_ACCOUNT_ID --region eu-west-1 --no-include-email`

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
